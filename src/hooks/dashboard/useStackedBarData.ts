
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subMonths, format } from 'date-fns';
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

export interface StackedBarData {
  data: Array<{
    month: string;
    [key: string]: string | number;
  }>;
  accountKeys: string[];
  accountColors: Record<string, string>;
}

export const useStackedBarData = (filters: DashboardFilters) => {
  return useQuery({
    queryKey: ['dashboard.stacked', filters],
    queryFn: async (): Promise<StackedBarData> => {
      const sixMonthsAgo = subMonths(new Date(), 6);

      let query = supabase
        .from('cost_line')
        .select(`
          amount,
          konto_nr,
          created_at,
          claims!inner(
            supplier_id,
            technician_id,
            machine_model
          )
        `)
        .gte('created_at', sixMonthsAgo.toISOString())
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

      // Get top 5 accounts by total cost
      const accountTotals = data?.reduce((acc, line) => {
        const account = line.konto_nr || 0;
        acc[account] = (acc[account] || 0) + Number(line.amount);
        return acc;
      }, {} as Record<number, number>) || {};

      const topAccounts = Object.entries(accountTotals)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([account]) => account);

      // Group by month and account
      const monthlyData: Record<string, Record<string, number>> = {};
      
      data?.forEach(line => {
        const month = format(new Date(line.created_at), 'MMM yyyy');
        const account = String(line.konto_nr || 0);
        
        if (topAccounts.includes(account)) {
          if (!monthlyData[month]) monthlyData[month] = {};
          monthlyData[month][account] = (monthlyData[month][account] || 0) + Number(line.amount);
        }
      });

      const chartData = Object.entries(monthlyData).map(([month, accounts]) => ({
        month,
        ...accounts
      }));

      const accountColors = topAccounts.reduce((colors, account, index) => {
        const colorPalette = ['#223368', '#4050a1', '#6366f1', '#8b5cf6', '#a855f7'];
        colors[account] = colorPalette[index % colorPalette.length];
        return colors;
      }, {} as Record<string, string>);

      return {
        data: chartData,
        accountKeys: topAccounts,
        accountColors
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};
