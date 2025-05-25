
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError, withRetry } from '@/utils/supabaseErrorHandler';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type ClaimCategory = Database['public']['Enums']['claim_category'];
type ClaimStatus = Database['public']['Enums']['claim_status'];

export function useEditClaim() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
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
      category?: ClaimCategory;
      description?: string;
      visma_order_no?: string;
      customer_po?: string;
      reported_by?: string;
      internal_note?: string;
      status?: ClaimStatus;
      account_code_id?: number;
    }) => {
      return withRetry(async () => {
        const { id, ...updateData } = data;
        
        const { data: result, error } = await supabase
          .from('claims')
          .update(updateData)
          .eq('id', id)
          .is('deleted_at', null)
          .select()
          .single();
        
        if (error) {
          handleSupabaseError(error, 'oppdatere reklamasjon');
          throw error;
        }
        
        return result;
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['claim', data.id] });
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      toast({
        title: "Reklamasjon oppdatert",
        description: "Endringene har blitt lagret.",
      });
    },
    onError: (error) => {
      console.error('Error updating claim:', error);
    }
  });
}
