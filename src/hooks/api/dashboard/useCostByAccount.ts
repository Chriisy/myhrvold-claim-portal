
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAccountCodes } from '@/hooks/useAccountCodes';
import { queryKeys } from '@/lib/queryKeys';
import { DASHBOARD_CONSTANTS } from '@/lib/dashboard-constants';
import { DashboardFilters } from '@/types/dashboard';
import { useMemo } from 'react';

export const useCostByAccount = (filters: DashboardFilters) => {
  const { data: accountCodes, isLoading: accountsLoading } = useAccountCodes();

  const costQuery = useQuery({
    queryKey: queryKeys.dashboard.costByAccount(filters),
    queryFn: async () => {
      const { data: totalCount, error: countError } = await supabase
        .from('cost_line')
        .select('id', { count: 'exact', head: true });
      
      if (countError) {
        console.error('Error counting cost_line entries:', countError);
      }

      const { data: claimsInRange, error: claimsError } = await supabase
        .from('claims')
        .select('id, created_at, supplier_id')
        .gte('created_at', filters.date_range.start.toISOString())
        .lte('created_at', filters.date_range.end.toISOString())
        .is('deleted_at', null);
      
      if (claimsError) {
        console.error('Error fetching claims:', claimsError);
      }

      let query = supabase
        .from('cost_line')
        .select(`
          amount,
          konto_nr,
          claim_id,
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

      if (error) {
        console.error('Cost by account query error:', error);
        throw error;
      }

      const accountTotals = data?.reduce((acc, line) => {
        const account = line.konto_nr || 0;
        acc[account] = (acc[account] || 0) + Number(line.amount);
        return acc;
      }, {} as Record<number, number>) || {};

      const result = Object.entries(accountTotals)
        .map(([account, amount]) => ({
          account: Number(account),
          amount
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, DASHBOARD_CONSTANTS.QUERY_LIMITS.TOP_ACCOUNTS);

      return result;
    },
    staleTime: DASHBOARD_CONSTANTS.CACHE_TIMES.STALE_TIME,
    gcTime: DASHBOARD_CONSTANTS.CACHE_TIMES.GC_TIME,
  });

  const enrichedData = useMemo(() => {
    if (!costQuery.data || !accountCodes) {
      return [];
    }
    
    const enriched = costQuery.data.map(item => {
      const account = accountCodes.find(acc => acc.konto_nr === item.account);
      return {
        ...item,
        accountName: account?.type || `Konto ${item.account}`,
        displayName: account ? `${item.account} - ${account.type}` : item.account.toString()
      };
    });
    
    return enriched;
  }, [costQuery.data, accountCodes]);

  return {
    data: enrichedData,
    isLoading: costQuery.isLoading || accountsLoading,
    isError: costQuery.isError,
    error: costQuery.error
  };
};
