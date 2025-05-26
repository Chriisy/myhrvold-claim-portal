
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
      console.log('useSupplierDistribution - Date range start:', filters.date_range.start.toISOString());
      console.log('useSupplierDistribution - Date range end:', filters.date_range.end.toISOString());
      
      // First, let's check if there's any data in cost_line table at all
      console.log('useSupplierDistribution - Checking total cost_line entries...');
      const { data: totalCount, error: countError } = await supabase
        .from('cost_line')
        .select('id', { count: 'exact', head: true });
      
      if (countError) {
        console.error('useSupplierDistribution - Error counting cost_line entries:', countError);
      } else {
        console.log('useSupplierDistribution - Total cost_line entries in database:', totalCount);
      }

      // Check if there are any claims in the date range
      console.log('useSupplierDistribution - Checking claims in date range...');
      const { data: claimsInRange, error: claimsError } = await supabase
        .from('claims')
        .select('id, created_at, supplier_id')
        .gte('created_at', filters.date_range.start.toISOString())
        .lte('created_at', filters.date_range.end.toISOString())
        .is('deleted_at', null);
      
      if (claimsError) {
        console.error('useSupplierDistribution - Error fetching claims:', claimsError);
      } else {
        console.log('useSupplierDistribution - Claims in date range:', claimsInRange?.length, claimsInRange);
      }

      // Now run the main query
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
        console.log('useSupplierDistribution - Filtering by supplier_id:', filters.supplier_id);
        query = query.eq('claims.supplier_id', filters.supplier_id);
      }
      if (filters.technician_id) {
        console.log('useSupplierDistribution - Filtering by technician_id:', filters.technician_id);
        query = query.eq('claims.technician_id', filters.technician_id);
      }
      if (filters.machine_model) {
        console.log('useSupplierDistribution - Filtering by machine_model:', filters.machine_model);
        query = query.ilike('claims.machine_model', `%${filters.machine_model}%`);
      }

      console.log('useSupplierDistribution - Executing main query...');
      const { data, error } = await query;

      if (error) {
        console.error('useSupplierDistribution - Query error:', error);
        console.error('useSupplierDistribution - Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('useSupplierDistribution - Raw data from query:', data);
      console.log('useSupplierDistribution - Number of cost lines:', data?.length);

      // Let's also log the structure of the first few items if they exist
      if (data && data.length > 0) {
        console.log('useSupplierDistribution - Sample data structure:', data.slice(0, 2));
        console.log('useSupplierDistribution - Claims data structure:', data.slice(0, 2).map(item => item.claims));
      }

      // Group by supplier
      const supplierTotals = data?.reduce((acc, line) => {
        const supplierName = line.claims?.suppliers?.name || 'Ukjent';
        console.log('useSupplierDistribution - Processing line:', {
          amount: line.amount,
          supplierName,
          claimsData: line.claims
        });
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
