
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryKeys';
import { DASHBOARD_CONSTANTS } from '@/lib/dashboard-constants';
import { DashboardFilters } from '@/types/dashboard';

// Helper function to assign colors to suppliers using constants
const getSupplierColor = (supplierName: string) => {
  const colors = DASHBOARD_CONSTANTS.COLORS.CHART_PALETTE;
  const hash = supplierName.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  return colors[Math.abs(hash) % colors.length];
};

export const useSupplierDistribution = (filters: DashboardFilters) => {
  return useQuery({
    queryKey: queryKeys.dashboard.supplierDistribution(filters),
    queryFn: async () => {
      console.log('useSupplierDistribution - Starting query with filters:', filters);
      
      try {
        // First, check if we have any cost data at all
        const { data: costCheck, error: costCheckError } = await supabase
          .from('cost_line')
          .select('id, amount')
          .gt('amount', 0)
          .limit(5);
        
        if (costCheckError) {
          console.error('useSupplierDistribution - Error checking cost data:', costCheckError);
          throw costCheckError;
        }
        
        console.log('useSupplierDistribution - Cost data sample:', costCheck);
        
        // If no cost data, fall back to claim count by supplier
        if (!costCheck || costCheck.length === 0) {
          console.log('useSupplierDistribution - No cost data found, falling back to claim count');
          
          let claimQuery = supabase
            .from('claims')
            .select(`
              supplier_id,
              suppliers(name)
            `)
            .gte('created_at', filters.date_range.start.toISOString())
            .lte('created_at', filters.date_range.end.toISOString())
            .is('deleted_at', null)
            .not('supplier_id', 'is', null);

          if (filters.supplier_id) {
            claimQuery = claimQuery.eq('supplier_id', filters.supplier_id);
          }
          if (filters.technician_id) {
            claimQuery = claimQuery.eq('technician_id', filters.technician_id);
          }
          if (filters.machine_model) {
            claimQuery = claimQuery.ilike('machine_model', `%${filters.machine_model}%`);
          }

          const { data: claimData, error: claimError } = await claimQuery;
          
          if (claimError) {
            console.error('useSupplierDistribution - Claim query error:', claimError);
            throw claimError;
          }
          
          // Group by supplier name and count claims
          const supplierCounts = claimData?.reduce((acc, claim) => {
            const supplierName = claim.suppliers?.name || 'Ukjent';
            acc[supplierName] = (acc[supplierName] || 0) + 1;
            return acc;
          }, {} as Record<string, number>) || {};
          
          const total = Object.values(supplierCounts).reduce((sum, count) => sum + count, 0);
          
          if (total === 0) {
            console.log('useSupplierDistribution - No claims found in date range');
            return [];
          }
          
          const result = Object.entries(supplierCounts)
            .map(([name, count]) => ({
              name,
              value: Math.round((count / total) * 100),
              amount: count,
              color: getSupplierColor(name)
            }))
            .sort((a, b) => b.amount - a.amount);
          
          console.log('useSupplierDistribution - Fallback result (claim count):', result);
          return result;
        }
        
        // Original query for cost-based distribution
        let query = supabase
          .from('cost_line')
          .select(`
            amount,
            claims!inner(
              supplier_id,
              technician_id,
              machine_model,
              created_at,
              suppliers(name)
            )
          `)
          .gte('claims.created_at', filters.date_range.start.toISOString())
          .lte('claims.created_at', filters.date_range.end.toISOString())
          .is('claims.deleted_at', null)
          .gt('amount', 0); // Only include costs > 0

        if (filters.supplier_id) {
          query = query.eq('claims.supplier_id', filters.supplier_id);
        }
        if (filters.technician_id) {
          query = query.eq('claims.technician_id', filters.technician_id);
        }
        if (filters.machine_model) {
          query = query.ilike('claims.machine_model', `%${filters.machine_model}%`);
        }

        const { data, error } = await query;

        if (error) {
          console.error('useSupplierDistribution - Cost query error:', error);
          throw error;
        }

        console.log('useSupplierDistribution - Cost data found:', data?.length || 0);

        // Group by supplier
        const supplierTotals = data?.reduce((acc, line) => {
          const supplierName = line.claims?.suppliers?.name || 'Ukjent';
          acc[supplierName] = (acc[supplierName] || 0) + Number(line.amount);
          return acc;
        }, {} as Record<string, number>) || {};

        const total = Object.values(supplierTotals).reduce((sum, amount) => sum + amount, 0);

        if (total === 0) {
          console.log('useSupplierDistribution - No cost data in date range, falling back to claim count');
          // Fallback to claim count if no costs
          return [];
        }

        const result = Object.entries(supplierTotals)
          .map(([name, amount]) => ({
            name,
            value: Math.round((amount / total) * 100),
            amount,
            color: getSupplierColor(name)
          }))
          .sort((a, b) => b.amount - a.amount);

        console.log('useSupplierDistribution - Final result:', result);
        return result;
        
      } catch (error) {
        console.error('useSupplierDistribution - Unexpected error:', error);
        throw error;
      }
    },
    staleTime: DASHBOARD_CONSTANTS.CACHE_TIMES.STALE_TIME,
    gcTime: DASHBOARD_CONSTANTS.CACHE_TIMES.GC_TIME,
    retry: (failureCount, error) => {
      console.log('useSupplierDistribution - Retry attempt:', failureCount, error);
      return failureCount < 2;
    },
  });
};
