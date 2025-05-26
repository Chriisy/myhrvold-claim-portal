
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
      console.log('useCostByAccount - Starting query with filters:', filters);
      console.log('useCostByAccount - Date range start:', filters.date_range.start.toISOString());
      console.log('useCostByAccount - Date range end:', filters.date_range.end.toISOString());
      
      // First, let's check if there's any data in cost_line table at all
      console.log('useCostByAccount - Checking total cost_line entries...');
      const { data: totalCount, error: countError } = await supabase
        .from('cost_line')
        .select('id', { count: 'exact', head: true });
      
      if (countError) {
        console.error('useCostByAccount - Error counting cost_line entries:', countError);
      } else {
        console.log('useCostByAccount - Total cost_line entries in database:', totalCount);
      }

      // Check if there are any claims in the date range
      console.log('useCostByAccount - Checking claims in date range...');
      const { data: claimsInRange, error: claimsError } = await supabase
        .from('claims')
        .select('id, created_at, supplier_id')
        .gte('created_at', filters.date_range.start.toISOString())
        .lte('created_at', filters.date_range.end.toISOString())
        .is('deleted_at', null);
      
      if (claimsError) {
        console.error('useCostByAccount - Error fetching claims:', claimsError);
      } else {
        console.log('useCostByAccount - Claims in date range:', claimsInRange?.length, claimsInRange);
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
        console.log('useCostByAccount - Filtering by supplier_id:', filters.supplier_id);
        query = query.eq('claims.supplier_id', filters.supplier_id);
      }
      if (filters.technician_id) {
        console.log('useCostByAccount - Filtering by technician_id:', filters.technician_id);
        query = query.eq('claims.technician_id', filters.technician_id);
      }
      if (filters.machine_model) {
        console.log('useCostByAccount - Filtering by machine_model:', filters.machine_model);
        query = query.ilike('claims.machine_model', `%${filters.machine_model}%`);
      }

      console.log('useCostByAccount - Executing query...');
      const { data, error } = await query;

      if (error) {
        console.error('useCostByAccount - Query error:', error);
        console.error('useCostByAccount - Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('useCostByAccount - Raw data from query:', data);
      console.log('useCostByAccount - Number of cost lines:', data?.length);

      // Let's also log the structure of the first few items if they exist
      if (data && data.length > 0) {
        console.log('useCostByAccount - Sample data structure:', data.slice(0, 2));
        console.log('useCostByAccount - Claims data structure:', data.slice(0, 2).map(item => item.claims));
      }

      // Group by account number
      const accountTotals = data?.reduce((acc, line) => {
        const account = line.konto_nr || 0;
        console.log('useCostByAccount - Processing line:', {
          amount: line.amount,
          konto_nr: line.konto_nr,
          claimsData: line.claims
        });
        acc[account] = (acc[account] || 0) + Number(line.amount);
        return acc;
      }, {} as Record<number, number>) || {};

      console.log('useCostByAccount - Account totals:', accountTotals);

      // Convert to array and sort by amount (top accounts)
      const result = Object.entries(accountTotals)
        .map(([account, amount]) => ({
          account: Number(account),
          amount
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, DASHBOARD_CONSTANTS.QUERY_LIMITS.TOP_ACCOUNTS);

      console.log('useCostByAccount - Final result:', result);
      return result;
    },
    staleTime: DASHBOARD_CONSTANTS.CACHE_TIMES.STALE_TIME,
    gcTime: DASHBOARD_CONSTANTS.CACHE_TIMES.GC_TIME,
  });

  // Enrich data with account information - memoized for performance
  const enrichedData = useMemo(() => {
    if (!costQuery.data || !accountCodes) {
      console.log('useCostByAccount - No data or account codes available for enrichment');
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
    
    console.log('useCostByAccount - Enriched data:', enriched);
    return enriched;
  }, [costQuery.data, accountCodes]);

  return {
    data: enrichedData,
    isLoading: costQuery.isLoading || accountsLoading,
    isError: costQuery.isError,
    error: costQuery.error
  };
};
