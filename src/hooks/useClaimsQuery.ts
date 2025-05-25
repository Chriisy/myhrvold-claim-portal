
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ErrorService } from '@/services/errorHandling/errorService';

interface ClaimWithRelations {
  id: string;
  customer_name?: string;
  customer_no?: string;
  customer_address?: string;
  department?: string;
  machine_model?: string;
  machine_serial?: string;
  part_number?: string;
  warranty?: boolean;
  quantity?: number;
  category?: string;
  status?: string;
  created_at: string;
  created_by?: string;
  suppliers?: { name: string } | null;
  technician?: { name: string } | null;
  salesperson?: { name: string } | null;
  account_codes?: {
    konto_nr: number;
    type: string;
    seller_flag: boolean;
    comment: string;
  } | null;
}

export const useClaimsQuery = () => {
  return useQuery({
    queryKey: ['claims'],
    queryFn: async (): Promise<ClaimWithRelations[]> => {
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
          console.error('Supabase error in useClaimsQuery:', error);
          ErrorService.handleSupabaseError(error, 'laste reklamasjoner');
          throw new Error(`Failed to fetch claims: ${error.message}`);
        }

        // Ensure we return a typed array with null safety
        return (data || []) as ClaimWithRelations[];
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Only retry on network errors, not on permissions or other issues
      if (error.message?.includes('permission') || error.message?.includes('unauthorized')) {
        return false;
      }
      return ErrorService.shouldRetryQuery(failureCount, error);
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};

export const useClaimQuery = (claimId: string) => {
  return useQuery({
    queryKey: ['claim', claimId],
    queryFn: async (): Promise<ClaimWithRelations | null> => {
      if (!claimId) {
        console.warn('No claim ID provided to useClaimQuery');
        return null;
      }
      
      return ErrorService.withRetry(async () => {
        // Validate UUID format
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(claimId);
        
        if (!isUUID) {
          console.warn('Invalid UUID format provided to useClaimQuery:', claimId);
          return null;
        }

        const { data, error } = await supabase
          .from('claims')
          .select(`
            *,
            suppliers(name),
            technician:users!claims_technician_id_fkey(name),
            salesperson:users!claims_salesperson_id_fkey(name),
            account_codes(konto_nr, type, seller_flag, comment)
          `)
          .eq('id', claimId)
          .is('deleted_at', null)
          .maybeSingle();

        if (error) {
          console.error('Supabase error in useClaimQuery:', error);
          ErrorService.handleSupabaseError(error, 'laste reklamasjon');
          throw new Error(`Failed to fetch claim: ${error.message}`);
        }

        return data as ClaimWithRelations | null;
      });
    },
    enabled: !!claimId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error) => {
      if (error.message?.includes('permission') || error.message?.includes('unauthorized')) {
        return false;
      }
      return failureCount < 2;
    },
  });
};
