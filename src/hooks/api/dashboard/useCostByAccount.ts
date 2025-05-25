
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAccountCodes } from '@/hooks/useAccountCodes';
import { queryKeys } from '@/lib/queryKeys';
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

export const useCostByAccount = (filters: DashboardFilters) => {
  const { data: accountCodes, isLoading: accountsLoading } = useAccountCodes();

  const costQuery = useQuery({
    queryKey: queryKeys.dashboard.costByAccount(filters),
    queryFn: async () => {
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

      if (error) throw error;

      // Group by account number
      const accountTotals = data?.reduce((acc, line) => {
        const account = line.konto_nr || 0;
        acc[account] = (acc[account] || 0) + Number(line.amount);
        return acc;
      }, {} as Record<number, number>) || {};

      // Convert to array and sort by amount (top 5)
      return Object.entries(accountTotals)
        .map(([account, amount]) => ({
          account: Number(account),
          amount
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Enrich data with account information
  const enrichedData = useMemo(() => {
    if (!costQuery.data || !accountCodes) return [];
    
    return costQuery.data.map(item => {
      const account = accountCodes.find(acc => acc.konto_nr === item.account);
      return {
        ...item,
        accountName: account?.type || `Konto ${item.account}`,
        displayName: account ? `${item.account} - ${account.type}` : item.account.toString()
      };
    });
  }, [costQuery.data, accountCodes]);

  return {
    data: enrichedData,
    isLoading: costQuery.isLoading || accountsLoading,
    isError: costQuery.isError,
    error: costQuery.error
  };
};
