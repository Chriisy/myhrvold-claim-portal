
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError, withRetry } from '@/utils/supabaseErrorHandler';

export interface AccountCode {
  konto_nr: number;
  type: string;
  seller_flag: boolean;
  comment: string | null;
  created_at: string;
}

export const useAccountCodes = () => {
  return useQuery({
    queryKey: ['accounts.codes'],
    queryFn: async (): Promise<AccountCode[]> => {
      return withRetry(async () => {
        const { data, error } = await supabase
          .from('account_codes')
          .select('*')
          .order('konto_nr', { ascending: true });

        if (error) {
          handleSupabaseError(error, 'laste kontoer');
          throw error;
        }

        return data || [];
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  });
};

// Default export for consistency
export default useAccountCodes;
