
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryKeys';
import { DASHBOARD_CONSTANTS } from '@/lib/dashboard-constants';
import { DashboardFilters } from '@/types/dashboard';

export const useRootCauseData = (filters: DashboardFilters) => {
  return useQuery({
    queryKey: queryKeys.dashboard.rootCause(filters),
    queryFn: async () => {
      let query = supabase
        .from('claims')
        .select('root_cause')
        .gte('created_at', filters.date_range.start.toISOString())
        .lte('created_at', filters.date_range.end.toISOString())
        .is('deleted_at', null)
        .not('root_cause', 'is', null);

      if (filters.supplier_id) {
        query = query.eq('supplier_id', filters.supplier_id);
      }
      if (filters.technician_id) {
        query = query.eq('technician_id', filters.technician_id);
      }
      if (filters.machine_model) {
        query = query.ilike('machine_model', `%${filters.machine_model}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      const rootCauseCounts = data?.reduce((acc, claim) => {
        const rootCause = claim.root_cause || 'Ukjent';
        acc[rootCause] = (acc[rootCause] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return Object.entries(rootCauseCounts)
        .map(([name, value], index) => ({
          name,
          value,
          color: DASHBOARD_CONSTANTS.COLORS.CHART_PALETTE[index % DASHBOARD_CONSTANTS.COLORS.CHART_PALETTE.length]
        }))
        .sort((a, b) => b.value - a.value);
    },
    staleTime: DASHBOARD_CONSTANTS.CACHE_TIMES.STALE_TIME,
    gcTime: DASHBOARD_CONSTANTS.CACHE_TIMES.GC_TIME,
  });
};
