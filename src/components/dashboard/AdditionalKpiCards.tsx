
import { Calculator, TrendingDown, DollarSign } from 'lucide-react';
import { useDashboardFilters } from '@/contexts/DashboardFiltersContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { memo } from 'react';
import KpiCard from './KpiCard';

const AdditionalKpiCards = memo(() => {
  const { filters } = useDashboardFilters();

  const { data: additionalKpis, isLoading } = useQuery({
    queryKey: ['additional-kpis', filters],
    queryFn: async () => {
      // Get average cost per claim
      let costQuery = supabase
        .from('cost_line')
        .select(`
          amount,
          claims!inner(
            id,
            supplier_id,
            technician_id,
            machine_model,
            created_at
          )
        `)
        .gte('claims.created_at', filters.date_range.start.toISOString())
        .lte('claims.created_at', filters.date_range.end.toISOString())
        .is('claims.deleted_at', null);

      if (filters.supplier_id) {
        costQuery = costQuery.eq('claims.supplier_id', filters.supplier_id);
      }
      if (filters.technician_id) {
        costQuery = costQuery.eq('claims.technician_id', filters.technician_id);
      }
      if (filters.machine_model) {
        costQuery = costQuery.ilike('claims.machine_model', `%${filters.machine_model}%`);
      }

      const { data: costData, error: costError } = await costQuery;
      if (costError) throw costError;

      // Get unique claims and calculate average
      const uniqueClaims = new Set();
      let totalCost = 0;

      costData?.forEach(line => {
        uniqueClaims.add(line.claims.id);
        totalCost += Number(line.amount);
      });

      const avgCostPerClaim = uniqueClaims.size > 0 ? totalCost / uniqueClaims.size : 0;

      // Get top machine models with most claims
      let claimsQuery = supabase
        .from('claims')
        .select('machine_model')
        .gte('created_at', filters.date_range.start.toISOString())
        .lte('created_at', filters.date_range.end.toISOString())
        .is('deleted_at', null)
        .not('machine_model', 'is', null);

      if (filters.supplier_id) {
        claimsQuery = claimsQuery.eq('supplier_id', filters.supplier_id);
      }
      if (filters.technician_id) {
        claimsQuery = claimsQuery.eq('technician_id', filters.technician_id);
      }

      const { data: claimsData, error: claimsError } = await claimsQuery;
      if (claimsError) throw claimsError;

      // Count machine models
      const modelCounts = claimsData?.reduce((acc, claim) => {
        const model = claim.machine_model || 'Ukjent';
        acc[model] = (acc[model] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const topModel = Object.entries(modelCounts)
        .sort(([,a], [,b]) => b - a)[0];

      return {
        avgCostPerClaim: Math.round(avgCostPerClaim),
        topMachineModel: topModel ? `${topModel[0]} (${topModel[1]})` : 'Ingen data',
        totalUniqueClaims: uniqueClaims.size
      };
    },
    staleTime: 10 * 60 * 1000,
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <KpiCard
        title="Snitt Kostnad/Reklamasjon"
        value={`${(additionalKpis?.avgCostPerClaim || 0).toLocaleString('nb-NO')} kr`}
        icon={Calculator}
        color="text-emerald-600"
        bgColor="bg-emerald-100"
        loading={isLoading}
      />
      
      <KpiCard
        title="Top Maskinmodell"
        value={additionalKpis?.topMachineModel || 'Laster...'}
        icon={TrendingDown}
        color="text-orange-600"
        bgColor="bg-orange-100"
        loading={isLoading}
      />
      
      <KpiCard
        title="Totale Reklamasjoner"
        value={additionalKpis?.totalUniqueClaims || 0}
        icon={DollarSign}
        color="text-cyan-600"
        bgColor="bg-cyan-100"
        loading={isLoading}
      />
    </div>
  );
});

AdditionalKpiCards.displayName = 'AdditionalKpiCards';

export default AdditionalKpiCards;
