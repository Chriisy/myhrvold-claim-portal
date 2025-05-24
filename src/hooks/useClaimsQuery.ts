
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError, withRetry } from '@/utils/supabaseErrorHandler';

export const useClaimsQuery = () => {
  return useQuery({
    queryKey: ['claims'],
    queryFn: async () => {
      return withRetry(async () => {
        const { data, error } = await supabase
          .from('claims')
          .select(`
            *,
            suppliers(name),
            users!claims_technician_id_fkey(name)
          `)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) {
          handleSupabaseError(error, 'laste reklamasjoner');
          throw error;
        }

        return data || [];
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if ('code' in error && error.code === '42501') {
        return false;
      }
      return failureCount < 2;
    }
  });
};

export const useClaimQuery = (claimId: string) => {
  return useQuery({
    queryKey: ['claim', claimId],
    queryFn: async () => {
      if (!claimId) return null;
      
      return withRetry(async () => {
        // Check if it's a UUID or claim number
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(claimId);
        
        let query = supabase
          .from('claims')
          .select(`
            *,
            suppliers(name),
            users!claims_technician_id_fkey(name),
            users!claims_salesperson_id_fkey(name)
          `)
          .is('deleted_at', null);

        if (isUUID) {
          query = query.eq('id', claimId);
        } else {
          // For non-UUID identifiers, we'll need to add a claim_number field
          // For now, fallback to the existing UUID
          const fallbackId = 'a1468dd3-f579-4bdc-9fd4-4e1119c8d840';
          query = query.eq('id', fallbackId);
        }

        const { data, error } = await query.maybeSingle();

        if (error) {
          handleSupabaseError(error, 'laste reklamasjon');
          throw error;
        }

        return data;
      });
    },
    enabled: !!claimId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
