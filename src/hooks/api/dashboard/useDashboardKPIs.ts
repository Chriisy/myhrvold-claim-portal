
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth } from 'date-fns';
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

      // Base query for claims
      let claimsQuery = supabase
        .from('claims')
        .select('id, status, due_date, closed_at, supplier_id, technician_id, machine_model')
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

      const { data: claims, error } = await claimsQuery;

      if (error) throw error;

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

      return {
        newClaims,
        openClaims,
        overdueClaims,
        closedThisMonth
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
