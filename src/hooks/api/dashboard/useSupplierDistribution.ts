
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
        .is('claims.deleted_at', null);

      if (filters.supplier_id) {
        query = query.eq('claims.supplier_id', filters.supplier_id);
      }
      if (filters.technician_id) {
        query = query.eq('claims.technician_id', filters.technician_id);
      }
      if (filters.machine_model) {
        query = query.ilike('claims.machine_model', `%${filters.machine_model}%`);
      }

      console.log('useSupplierDistribution - Executing query...');
      const { data, error } = await query;

      if (error) {
        console.error('useSupplierDistribution - Query error:', error);
        throw error;
      }

      console.log('useSupplierDistribution - Raw data from query:', data);
      console.log('useSupplierDistribution - Number of cost lines:', data?.length);

      // Group by supplier
      const supplierTotals = data?.reduce((acc, line) => {
        const supplierName = line.claims?.suppliers?.name || 'Ukjent';
        acc[supplierName] = (acc[supplierName] || 0) + Number(line.amount);
        return acc;
      }, {} as Record<string, number>) || {};

      console.log('useSupplierDistribution - Supplier totals:', supplierTotals);

      const total = Object.values(supplierTotals).reduce((sum, amount) => sum + amount, 0);
      console.log('useSupplierDistribution - Total amount:', total);

      if (total === 0) {
        console.log('useSupplierDistribution - No data found, returning empty array');
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
    },
    staleTime: DASHBOARD_CONSTANTS.CACHE_TIMES.STALE_TIME,
    gcTime: DASHBOARD_CONSTANTS.CACHE_TIMES.GC_TIME,
  });
};
