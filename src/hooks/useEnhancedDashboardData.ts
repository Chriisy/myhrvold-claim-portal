
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, subDays, subMonths, format } from 'date-fns';

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

export const useEnhancedDashboardKPIs = (filters: DashboardFilters) => {
  return useQuery({
    queryKey: ['enhanced-dashboard-kpis', filters],
    queryFn: async () => {
      const today = new Date();
      const thirtyDaysAgo = subDays(today, 30);
      const ninetyDaysAgo = subDays(today, 90);

      // Get overdue claims
      let overdueQuery = supabase
        .from('claims')
        .select('id, due_date, status')
        .lt('due_date', today.toISOString())
        .not('status', 'in', '("Lukket","Bokført")')
        .is('deleted_at', null);

      if (filters.supplier_id) {
        overdueQuery = overdueQuery.eq('supplier_id', filters.supplier_id);
      }
      if (filters.technician_id) {
        overdueQuery = overdueQuery.eq('technician_id', filters.technician_id);
      }
      if (filters.machine_model) {
        overdueQuery = overdueQuery.ilike('machine_model', `%${filters.machine_model}%`);
      }

      const { data: overdueClaims } = await overdueQuery;

      // Get warranty costs for last 30 days
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

      const { data: warrantyCosts } = await warrantyCostQuery;

      // Get average lead time for claims closed in last 90 days
      let leadTimeQuery = supabase
        .from('claims')
        .select('created_at, closed_at, supplier_id, technician_id, machine_model')
        .not('closed_at', 'is', null)
        .gte('closed_at', ninetyDaysAgo.toISOString())
        .is('deleted_at', null);

      if (filters.supplier_id) {
        leadTimeQuery = leadTimeQuery.eq('supplier_id', filters.supplier_id);
      }
      if (filters.technician_id) {
        leadTimeQuery = leadTimeQuery.eq('technician_id', filters.technician_id);
      }
      if (filters.machine_model) {
        leadTimeQuery = leadTimeQuery.ilike('machine_model', `%${filters.machine_model}%`);
      }

      const { data: closedClaims } = await leadTimeQuery;

      const totalWarrantyCost = warrantyCosts?.reduce((sum, cost) => sum + Number(cost.amount), 0) || 0;

      const avgLeadTime = closedClaims?.length ? 
        closedClaims.reduce((sum, claim) => {
          const created = new Date(claim.created_at);
          const closed = new Date(claim.closed_at!);
          const diffDays = Math.floor((closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
          return sum + diffDays;
        }, 0) / closedClaims.length : 0;

      return {
        overdueClaims: overdueClaims?.length || 0,
        totalWarrantyCost,
        avgLeadTime: Math.round(avgLeadTime)
      };
    }
  });
};

export const useStackedBarData = (filters: DashboardFilters) => {
  return useQuery({
    queryKey: ['stacked-bar-data', filters],
    queryFn: async () => {
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

      const { data } = await query;

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
    }
  });
};

export const useRootCauseDistribution = (filters: DashboardFilters) => {
  return useQuery({
    queryKey: ['root-cause-distribution', filters],
    queryFn: async () => {
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

      const { data } = await query;

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
    }
  });
};
