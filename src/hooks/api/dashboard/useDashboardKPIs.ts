
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, subDays, subMonths } from 'date-fns';
import { queryKeys } from '@/lib/queryKeys';

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

export const useDashboardKPIs = (filters: DashboardFilters) => {
  return useQuery({
    queryKey: queryKeys.dashboard.kpis(filters),
    queryFn: async () => {
      const today = new Date();
      const currentMonthStart = startOfMonth(today);
      const currentMonthEnd = endOfMonth(today);
      const thirtyDaysAgo = subDays(today, 30);
      const ninetyDaysAgo = subDays(today, 90);
      
      // Previous period for comparison
      const previousMonthStart = startOfMonth(subMonths(today, 1));
      const previousMonthEnd = endOfMonth(subMonths(today, 1));
      const sixtyDaysAgo = subDays(today, 60);

      // Base query for current period claims
      let claimsQuery = supabase
        .from('claims')
        .select('id, status, due_date, closed_at, created_at, supplier_id, technician_id, machine_model, warranty')
        .gte('created_at', filters.date_range.start.toISOString())
        .lte('created_at', filters.date_range.end.toISOString())
        .is('deleted_at', null);

      // Base query for previous period claims (for comparison)
      let prevClaimsQuery = supabase
        .from('claims')
        .select('id, status, due_date, closed_at, created_at, supplier_id, technician_id, machine_model, warranty')
        .gte('created_at', previousMonthStart.toISOString())
        .lte('created_at', previousMonthEnd.toISOString())
        .is('deleted_at', null);

      // Apply filters to both queries
      if (filters.supplier_id) {
        claimsQuery = claimsQuery.eq('supplier_id', filters.supplier_id);
        prevClaimsQuery = prevClaimsQuery.eq('supplier_id', filters.supplier_id);
      }
      if (filters.machine_model) {
        claimsQuery = claimsQuery.ilike('machine_model', `%${filters.machine_model}%`);
        prevClaimsQuery = prevClaimsQuery.ilike('machine_model', `%${filters.machine_model}%`);
      }
      if (filters.technician_id) {
        claimsQuery = claimsQuery.eq('technician_id', filters.technician_id);
        prevClaimsQuery = prevClaimsQuery.eq('technician_id', filters.technician_id);
      }

      // Build warranty cost queries for current and previous periods
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

      let prevWarrantyCostQuery = supabase
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
        .gte('created_at', sixtyDaysAgo.toISOString())
        .lt('created_at', thirtyDaysAgo.toISOString())
        .eq('claims.warranty', true)
        .is('claims.deleted_at', null);

      if (filters.supplier_id) {
        warrantyCostQuery = warrantyCostQuery.eq('claims.supplier_id', filters.supplier_id);
        prevWarrantyCostQuery = prevWarrantyCostQuery.eq('claims.supplier_id', filters.supplier_id);
      }
      if (filters.technician_id) {
        warrantyCostQuery = warrantyCostQuery.eq('claims.technician_id', filters.technician_id);
        prevWarrantyCostQuery = prevWarrantyCostQuery.eq('claims.technician_id', filters.technician_id);
      }
      if (filters.machine_model) {
        warrantyCostQuery = warrantyCostQuery.ilike('claims.machine_model', `%${filters.machine_model}%`);
        prevWarrantyCostQuery = prevWarrantyCostQuery.ilike('claims.machine_model', `%${filters.machine_model}%`);
      }

      // Execute all queries in parallel
      const [claimsResult, prevClaimsResult, warrantyCostsResult, prevWarrantyCostsResult] = await Promise.all([
        claimsQuery,
        prevClaimsQuery,
        warrantyCostQuery,
        prevWarrantyCostQuery
      ]);

      if (claimsResult.error) throw claimsResult.error;
      if (prevClaimsResult.error) throw prevClaimsResult.error;
      if (warrantyCostsResult.error) throw warrantyCostsResult.error;
      if (prevWarrantyCostsResult.error) throw prevWarrantyCostsResult.error;

      const claims = claimsResult.data || [];
      const prevClaims = prevClaimsResult.data || [];
      const warrantyCosts = warrantyCostsResult.data || [];
      const prevWarrantyCosts = prevWarrantyCostsResult.data || [];

      // Calculate current period metrics
      const newClaims = claims?.filter(claim => claim.status === 'Ny').length || 0;
      const openClaims = claims?.filter(claim => 
        ['Avventer', 'Godkjent'].includes(claim.status)
      ).length || 0;
      const overdueClaims = claims?.filter(claim => 
        claim.due_date && 
        new Date(claim.due_date) < today && 
        !['Bokført', 'Lukket'].includes(claim.status)
      ).length || 0;
      const closedThisMonth = claims?.filter(claim => 
        claim.closed_at &&
        new Date(claim.closed_at) >= currentMonthStart &&
        new Date(claim.closed_at) <= currentMonthEnd
      ).length || 0;

      // Calculate previous period metrics
      const prevNewClaims = prevClaims?.filter(claim => claim.status === 'Ny').length || 0;
      const prevOpenClaims = prevClaims?.filter(claim => 
        ['Avventer', 'Godkjent'].includes(claim.status)
      ).length || 0;
      const prevOverdueClaims = prevClaims?.filter(claim => 
        claim.due_date && 
        new Date(claim.due_date) < subMonths(today, 1) && 
        !['Bokført', 'Lukket'].includes(claim.status)
      ).length || 0;
      const prevClosedThisMonth = prevClaims?.filter(claim => 
        claim.closed_at &&
        new Date(claim.closed_at) >= previousMonthStart &&
        new Date(claim.closed_at) <= previousMonthEnd
      ).length || 0;

      // Calculate warranty costs
      const totalWarrantyCost = warrantyCosts.reduce((sum, cost) => sum + Number(cost.amount), 0);
      const prevTotalWarrantyCost = prevWarrantyCosts.reduce((sum, cost) => sum + Number(cost.amount), 0);

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

      // Previous period lead time
      const prevClosedClaims = prevClaims.filter(claim => 
        claim.closed_at &&
        new Date(claim.closed_at) >= previousMonthStart &&
        new Date(claim.closed_at) <= previousMonthEnd
      );

      const prevAvgLeadTime = prevClosedClaims.length ? 
        prevClosedClaims.reduce((sum, claim) => {
          const created = new Date(claim.created_at);
          const closed = new Date(claim.closed_at!);
          const diffDays = Math.floor((closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
          return sum + diffDays;
        }, 0) / prevClosedClaims.length : 0;

      // Helper function to calculate trend
      const calculateTrend = (current: number, previous: number) => {
        if (previous === 0) return { percentage: 0, direction: 'stable' as const };
        const percentage = Math.round(((current - previous) / previous) * 100);
        const direction = percentage > 0 ? 'up' as const : percentage < 0 ? 'down' as const : 'stable' as const;
        return { percentage: Math.abs(percentage), direction };
      };

      return {
        newClaims,
        openClaims,
        overdueClaims,
        closedThisMonth,
        totalWarrantyCost,
        avgLeadTime: Math.round(avgLeadTime),
        trends: {
          newClaims: calculateTrend(newClaims, prevNewClaims),
          openClaims: calculateTrend(openClaims, prevOpenClaims),
          overdueClaims: calculateTrend(overdueClaims, prevOverdueClaims),
          closedThisMonth: calculateTrend(closedThisMonth, prevClosedThisMonth),
          totalWarrantyCost: calculateTrend(totalWarrantyCost, prevTotalWarrantyCost),
          avgLeadTime: calculateTrend(avgLeadTime, prevAvgLeadTime)
        }
      };
    },
    staleTime: 15 * 60 * 1000, // Increased to 15 minutes for better performance
    gcTime: 30 * 60 * 1000, // Increased to 30 minutes
  });
};
