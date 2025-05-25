
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError, withRetry } from '@/utils/supabaseErrorHandler';

export interface Account {
  konto_nr: number;
  type: string;
  seller_flag: boolean;
  comment: string;
  created_at: string;
}

export function useAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      return withRetry(async () => {
        const { data, error } = await supabase
          .from('accounts')
          .select('*')
          .order('konto_nr');
        
        if (error) {
          handleSupabaseError(error, 'hente kontoer');
          throw error;
        }
        
        return data as Account[];
      });
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - accounts rarely change
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

export function useAccountsByFlag(sellerFlag?: boolean) {
  const { data: accounts, ...rest } = useAccounts();
  
  const filteredAccounts = sellerFlag !== undefined 
    ? accounts?.filter(account => account.seller_flag === sellerFlag)
    : accounts;
    
  return {
    data: filteredAccounts,
    ...rest
  };
}
