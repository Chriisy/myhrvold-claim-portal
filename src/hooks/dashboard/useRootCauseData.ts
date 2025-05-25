
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subMonths } from 'date-fns';
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

export interface RootCauseData {
  name: string;
  value: number;
  color: string;
}

export const useRootCauseData = (filters: DashboardFilters) => {
  return useQuery({
    queryKey: ['dashboard.rootCause', filters],
    queryFn: async (): Promise<RootCauseData[]> => {
      const sixMonthsAgo = subMonths(new Date(), 6);

      let query = supabase
        .from('claims')
        .select('root_cause, supplier_id, technician_id, machine_model')
        .gte('created_at', sixMonthsAgo.toISOString())
        .not('root_cause', 'is', null)
        .neq('root_cause', '')
        .is('deleted_at', null);

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

      const causeCounts = data?.reduce((acc, claim) => {
        const cause = claim.root_cause || 'Ukjent';
        acc[cause] = (acc[cause] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const sortedCauses = Object.entries(causeCounts)
        .sort(([,a], [,b]) => b - a);

      const top5 = sortedCauses.slice(0, 5);
      const others = sortedCauses.slice(5);
      const otherTotal = others.reduce((sum, [,count]) => sum + count, 0);

      const chartData = [
        ...top5.map(([name, value], index) => ({
          name,
          value,
          color: ['#223368', '#4050a1', '#6366f1', '#8b5cf6', '#a855f7'][index]
        })),
        ...(otherTotal > 0 ? [{
          name: 'Andre',
          value: otherTotal,
          color: '#94a3b8'
        }] : [])
      ];

      return chartData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};
