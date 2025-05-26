
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError, withRetry } from '@/utils/supabaseErrorHandler';

interface TimelineEvent {
  id: string;
  claim_id: string;
  message: string;
  event_type: 'manual' | 'status_change' | 'file_upload' | 'file_delete' | 'claim_update' | 'cost_added' | 'credit_added';
  metadata: any;
  created_by: string;
  created_at: string;
}

export function useClaimTimeline(claimIdOrNumber: string) {
  return useQuery({
    queryKey: ['timeline', claimIdOrNumber],
    queryFn: async (): Promise<TimelineEvent[]> => {
      return withRetry(async () => {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(claimIdOrNumber);
        
        let actualClaimId = claimIdOrNumber;
        
        if (!isUUID) {
          // For non-UUID identifiers, try to find the claim
          const { data: claimData, error: claimError } = await supabase
            .from('claims')
            .select('id')
            .is('deleted_at', null)
            .eq('id', claimIdOrNumber)
            .maybeSingle();
            
          if (claimError) {
            handleSupabaseError(claimError, 'finne reklamasjon');
            return [];
          }
          
          if (!claimData) {
            console.warn('Could not find claim with identifier:', claimIdOrNumber);
            return [];
          }
          
          actualClaimId = claimData.id;
        }
        
        const { data, error } = await supabase
          .from('timeline_item')
          .select('*')
          .eq('claim_id', actualClaimId)
          .order('created_at', { ascending: false });
        
        if (error) {
          handleSupabaseError(error, 'laste tidslinje');
          throw error;
        }
        
        return data || [];
      });
    },
    enabled: !!claimIdOrNumber,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}
