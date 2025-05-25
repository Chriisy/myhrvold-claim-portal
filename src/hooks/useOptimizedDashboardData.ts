
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, subDays, subMonths, format } from 'date-fns';
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

export const useOptimizedDashboardData = (filters: DashboardFilters) => {
  return useQuery({
    queryKey: ['optimized-dashboard-data', filters],
    queryFn: async () => {
      const today = new Date();
      const currentMonthStart = startOfMonth(today);
      const currentMonthEnd = endOfMonth(today);
      const thirtyDaysAgo = subDays(today, 30);
      const ninetyDaysAgo = subDays(today, 90);
      const sixMonthsAgo = subMonths(today, 6);

      // Build base claims query with all filters
      let claimsQuery = supabase
        .from('claims')
        .select('id, status, due_date, closed_at, created_at, supplier_id, technician_id, machine_model, warranty, root_cause')
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

      // Build cost lines query with filters
      let costQuery = supabase
        .from('cost_line')
        .select(`
          amount,
          konto_nr,
          created_at,
          claims!inner(
            supplier_id,
            technician_id,
            machine_model,
            warranty,
            created_at
          )
        `)
        .gte('created_at', sixMonthsAgo.toISOString())
        .is('claims.deleted_at', null);

      if (filters.supplier_id) {
        costQuery = costQuery.eq('claims.supplier_id', filters.supplier_id);
      }
      if (filters.technician_id) {
        costQuery = costQuery.eq('claims.technician_id', filters.technician_id);
      }
      if (filters.machine_model) {
        costQuery = costQuery.ilike('claims.machine_model', `%${filters.machine_model}%`);
      }

      // Execute all queries in parallel
      const [claimsResult, costLinesResult] = await Promise.all([
        claimsQuery,
        costQuery
      ]);

      if (claimsResult.error) throw claimsResult.error;
      if (costLinesResult.error) throw costLinesResult.error;

      const claims = claimsResult.data || [];
      const costLines = costLinesResult.data || [];

      // Calculate all KPIs in one pass
      const newClaims = claims.filter(claim => claim.status === 'Ny').length;
      const openClaims = claims.filter(claim => 
        ['Avventer', 'Godkjent'].includes(claim.status)
      ).length;
      const overdueClaims = claims.filter(claim => 
        claim.due_date && 
        new Date(claim.due_date) < today && 
        !['Bokført', 'Lukket'].includes(claim.status)
      ).length;
      const closedThisMonth = claims.filter(claim => 
        claim.closed_at &&
        new Date(claim.closed_at) >= currentMonthStart &&
        new Date(claim.closed_at) <= currentMonthEnd
      ).length;

      // Calculate warranty costs for last 30 days
      const totalWarrantyCost = costLines
        .filter(line => 
          new Date(line.created_at) >= thirtyDaysAgo &&
          line.claims?.warranty === true
        )
        .reduce((sum, line) => sum + Number(line.amount), 0);

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

      // Calculate stacked bar chart data
      const accountTotals = costLines.reduce((acc, line) => {
        const account = line.konto_nr || 0;
        acc[account] = (acc[account] || 0) + Number(line.amount);
        return acc;
      }, {} as Record<number, number>);

      const topAccounts = Object.entries(accountTotals)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([account]) => account);

      const monthlyData: Record<string, Record<string, number>> = {};
      
      costLines.forEach(line => {
        const month = format(new Date(line.created_at), 'MMM yyyy');
        const account = String(line.konto_nr || 0);
        
        if (topAccounts.includes(account)) {
          if (!monthlyData[month]) monthlyData[month] = {};
          monthlyData[month][account] = (monthlyData[month][account] || 0) + Number(line.amount);
        }
      });

      const stackedBarData = Object.entries(monthlyData).map(([month, accounts]) => ({
        month,
        ...accounts
      }));

      const accountColors = topAccounts.reduce((colors, account, index) => {
        const colorPalette = ['#223368', '#4050a1', '#6366f1', '#8b5cf6', '#a855f7'];
        colors[account] = colorPalette[index % colorPalette.length];
        return colors;
      }, {} as Record<string, string>);

      // Calculate root cause distribution for last 6 months
      const rootCauseCounts = claims
        .filter(claim => 
          claim.root_cause && 
          claim.root_cause.trim() !== '' &&
          new Date(claim.created_at) >= sixMonthsAgo
        )
        .reduce((acc, claim) => {
          const cause = claim.root_cause || 'Ukjent';
          acc[cause] = (acc[cause] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

      const sortedCauses = Object.entries(rootCauseCounts)
        .sort(([,a], [,b]) => b - a);

      const top5Causes = sortedCauses.slice(0, 5);
      const others = sortedCauses.slice(5);
      const otherTotal = others.reduce((sum, [,count]) => sum + count, 0);

      const rootCauseData = [
        ...top5Causes.map(([name, value], index) => ({
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

      return {
        kpis: {
          newClaims,
          openClaims,
          overdueClaims,
          closedThisMonth,
          totalWarrantyCost,
          avgLeadTime: Math.round(avgLeadTime)
        },
        stackedBarData: {
          data: stackedBarData,
          accountKeys: topAccounts,
          accountColors
        },
        rootCauseData
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

// Memoized selectors for performance
export const useKPIData = (filters: DashboardFilters) => {
  const { data, isLoading, error } = useOptimizedDashboardData(filters);
  
  return useMemo(() => ({
    data: data?.kpis,
    isLoading,
    error
  }), [data?.kpis, isLoading, error]);
};

export const useStackedBarChartData = (filters: DashboardFilters) => {
  const { data, isLoading, error } = useOptimizedDashboardData(filters);
  
  return useMemo(() => ({
    data: data?.stackedBarData,
    isLoading,
    error
  }), [data?.stackedBarData, isLoading, error]);
};

export const useRootCauseChartData = (filters: DashboardFilters) => {
  const { data, isLoading, error } = useOptimizedDashboardData(filters);
  
  return useMemo(() => ({
    data: data?.rootCauseData,
    isLoading,
    error
  }), [data?.rootCauseData, isLoading, error]);
};
