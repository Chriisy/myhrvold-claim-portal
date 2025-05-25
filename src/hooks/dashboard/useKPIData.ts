
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, subDays } from 'date-fns';
import { useMemo } from 'react';

interface DashboardFilters {
  supplier_id?: string;
  machine_model?: string;
  konto_nr?: number;
  technician_id?: string;
  date_range: {
    start: Date;
    end: Date;
  };
}

export interface KPIData {
  newClaims: number;
  openClaims: number;
  overdueClaims: number;
  closedThisMonth: number;
  totalWarrantyCost: number;
  avgLeadTime: number;
}

export const useKPIData = (filters: DashboardFilters) => {
  return useQuery({
    queryKey: ['dashboard.kpis', filters],
    queryFn: async (): Promise<KPIData> => {
      const today = new Date();
      const currentMonthStart = startOfMonth(today);
      const currentMonthEnd = endOfMonth(today);
      const thirtyDaysAgo = subDays(today, 30);
      const ninetyDaysAgo = subDays(today, 90);

      // Build base claims query with all filters
      let claimsQuery = supabase
        .from('claims')
        .select('id, status, due_date, closed_at, created_at, supplier_id, technician_id, machine_model, warranty')
        .gte('created_at', filters.date_range.start.toISOString())
        .lte('created_at', filters.date_range.end.toISOString())
        .is('deleted_at', null);

      // Apply filters
      if (filters.supplier_id) {
        claimsQuery = claimsQuery.eq('supplier_id', filters.supplier_id);
      }
      if (filters.machine_model) {
        claimsQuery = claimsQuery.ilike('machine_model', `%${filters.machine_model}%`);
      }
      if (filters.technician_id) {
        claimsQuery = claimsQuery.eq('technician_id', filters.technician_id);
      }

      // Build warranty cost query
      let warrantyCostQuery = supabase
        .from('cost_line')
        .select(`
          amount,
          claims!inner(
            warranty,
            supplier_id,
            technician_id,
            machine_model,
            created_at
          )
        `)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .eq('claims.warranty', true)
        .is('claims.deleted_at', null);

      if (filters.supplier_id) {
        warrantyCostQuery = warrantyCostQuery.eq('claims.supplier_id', filters.supplier_id);
      }
      if (filters.technician_id) {
        warrantyCostQuery = warrantyCostQuery.eq('claims.technician_id', filters.technician_id);
      }
      if (filters.machine_model) {
        warrantyCostQuery = warrantyCostQuery.ilike('claims.machine_model', `%${filters.machine_model}%`);
      }

      // Execute queries in parallel
      const [claimsResult, warrantyCostsResult] = await Promise.all([
        claimsQuery,
        warrantyCostQuery
      ]);

      if (claimsResult.error) throw claimsResult.error;
      if (warrantyCostsResult.error) throw warrantyCostsResult.error;

      const claims = claimsResult.data || [];
      const warrantyCosts = warrantyCostsResult.data || [];

      // Calculate KPIs
      const newClaims = claims.filter(claim => claim.status === 'Ny').length;
      const openClaims = claims.filter(claim => 
        ['Avventer', 'Godkjent'].includes(claim.status)
      ).length;
      const overdueClaims = claims.filter(claim => 
        claim.due_date && 
        new Date(claim.due_date) < today && 
        !['Bokført', 'Lukket'].includes(claim.status)
      ).length;
      const closedThisMonth = claims.filter(claim => 
        claim.closed_at &&
        new Date(claim.closed_at) >= currentMonthStart &&
        new Date(claim.closed_at) <= currentMonthEnd
      ).length;

      const totalWarrantyCost = warrantyCosts.reduce((sum, cost) => sum + Number(cost.amount), 0);

      // Calculate average lead time for closed claims in last 90 days
      const closedClaimsLast90Days = claims.filter(claim => 
        claim.closed_at &&
        new Date(claim.closed_at) >= ninetyDaysAgo
      );

      const avgLeadTime = closedClaimsLast90Days.length ? 
        closedClaimsLast90Days.reduce((sum, claim) => {
          const created = new Date(claim.created_at);
          const closed = new Date(claim.closed_at!);
          const diffDays = Math.floor((closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
          return sum + diffDays;
        }, 0) / closedClaimsLast90Days.length : 0;

      return {
        newClaims,
        openClaims,
        overdueClaims,
        closedThisMonth,
        totalWarrantyCost,
        avgLeadTime: Math.round(avgLeadTime)
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};
