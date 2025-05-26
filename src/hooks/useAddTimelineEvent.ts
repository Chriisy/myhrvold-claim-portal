
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError, withRetry } from '@/utils/supabaseErrorHandler';
import { useToast } from '@/hooks/use-toast';

interface AddTimelineEventData {
  claim_id: string;
  message: string;
  created_by: string;
  event_type?: 'manual' | 'status_change' | 'file_upload' | 'file_delete' | 'claim_update' | 'cost_added' | 'credit_added';
  metadata?: any;
}

export function useAddTimelineEvent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: AddTimelineEventData) => {
      return withRetry(async () => {
        const { data: result, error } = await supabase
          .from('timeline_item')
          .insert({
            claim_id: data.claim_id,
            message: data.message,
            created_by: data.created_by,
            event_type: data.event_type || 'manual',
            metadata: data.metadata || {},
          })
          .select()
          .single();
        
        if (error) {
          handleSupabaseError(error, 'legge til hendelse');
          throw error;
        }
        
        return result;
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['timeline', variables.claim_id] });
      toast({
        title: "Hendelse lagt til",
        description: "Tidslinjen har blitt oppdatert.",
      });
    },
    onError: (error) => {
      console.error('Error adding timeline event:', error);
    }
  });
}
