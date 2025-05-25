
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ErrorService } from '@/services/errorHandling/errorService';

export const useClaimsQuery = () => {
  return useQuery({
    queryKey: ['claims'],
    queryFn: async () => {
      return ErrorService.withRetry(async () => {
        const { data, error } = await supabase
          .from('claims')
          .select(`
            *,
            suppliers(name),
            technician:users!claims_technician_id_fkey(name),
            salesperson:users!claims_salesperson_id_fkey(name),
            account_codes(konto_nr, type, seller_flag, comment)
          `)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) {
          ErrorService.handleSupabaseError(error, 'laste reklamasjoner');
          throw error;
        }

        return data || [];
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: ErrorService.shouldRetryQuery
  });
};

export const useClaimQuery = (claimId: string) => {
  return useQuery({
    queryKey: ['claim', claimId],
    queryFn: async () => {
      if (!claimId) return null;
      
      return ErrorService.withRetry(async () => {
        // Check if it's a UUID or claim number
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(claimId);
        
        let query = supabase
          .from('claims')
          .select(`
            *,
            suppliers(name),
            technician:users!claims_technician_id_fkey(name),
            salesperson:users!claims_salesperson_id_fkey(name),
            account_codes(konto_nr, type, seller_flag, comment)
          `)
          .is('deleted_at', null);

        if (isUUID) {
          query = query.eq('id', claimId);
        } else {
          // For non-UUID identifiers, we need a proper lookup mechanism
          // This should be enhanced when claim_number field is added
          console.warn('Non-UUID claim identifier provided:', claimId);
          return null;
        }

        const { data, error } = await query.maybeSingle();

        if (error) {
          ErrorService.handleSupabaseError(error, 'laste reklamasjon');
          throw error;
        }

        return data;
      });
    },
    enabled: !!claimId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
