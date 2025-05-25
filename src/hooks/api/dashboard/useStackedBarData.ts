
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryKeys';
import { DASHBOARD_CONSTANTS } from '@/constants/dashboard';
import { format, subMonths } from 'date-fns';

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

export const useStackedBarData = (filters: DashboardFilters) => {
  return useQuery({
    queryKey: queryKeys.dashboard.stackedBar(filters),
    queryFn: async () => {
      let query = supabase
        .from('cost_line')
        .select(`
          amount,
          konto_nr,
          date,
          claims!inner(
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
        query = query.eq('claims.supplier_id', filters.supplier_id);
      }
      if (filters.technician_id) {
        query = query.eq('claims.technician_id', filters.technician_id);
      }
      if (filters.machine_model) {
        query = query.ilike('claims.machine_model', `%${filters.machine_model}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Get top 5 accounts by total amount
      const accountTotals = data?.reduce((acc, line) => {
        const account = line.konto_nr || 0;
        acc[account] = (acc[account] || 0) + Number(line.amount);
        return acc;
      }, {} as Record<number, number>) || {};

      const topAccounts = Object.entries(accountTotals)
        .sort(([,a], [,b]) => b - a)
        .slice(0, DASHBOARD_CONSTANTS.QUERY_LIMITS.TOP_ACCOUNTS)
        .map(([account]) => Number(account));

      // Group by month and account
      const monthlyData = data?.reduce((acc, line) => {
        const month = format(new Date(line.date), 'MMM yyyy');
        const account = line.konto_nr || 0;
        
        if (!topAccounts.includes(account)) return acc;
        
        if (!acc[month]) acc[month] = {};
        acc[month][account] = (acc[month][account] || 0) + Number(line.amount);
        return acc;
      }, {} as Record<string, Record<number, number>>) || {};

      // Convert to chart format
      const chartData = Object.entries(monthlyData).map(([month, accounts]) => ({
        month,
        ...accounts
      }));

      // Generate colors for accounts
      const accountColors = topAccounts.reduce((acc, account, index) => {
        acc[account] = DASHBOARD_CONSTANTS.COLORS.CHART_PALETTE[index % DASHBOARD_CONSTANTS.COLORS.CHART_PALETTE.length];
        return acc;
      }, {} as Record<number, string>);

      return {
        data: chartData,
        accountKeys: topAccounts.map(String),
        accountColors: Object.fromEntries(
          Object.entries(accountColors).map(([key, value]) => [key.toString(), value])
        )
      };
    },
    staleTime: DASHBOARD_CONSTANTS.CACHE_TIMES.STALE_TIME,
    gcTime: DASHBOARD_CONSTANTS.CACHE_TIMES.GC_TIME,
  });
};
