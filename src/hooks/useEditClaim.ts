
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError, withRetry } from '@/utils/supabaseErrorHandler';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type ClaimCategory = Database['public']['Enums']['claim_category'];
type ClaimStatus = Database['public']['Enums']['claim_status'];
type ActionStatus = Database['public']['Enums']['action_status'];

export function useEditClaim() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      customer_name?: string | null;
      customer_no?: string | null;
      customer_address?: string | null;
      customer_postal_code?: string | null;
      customer_city?: string | null;
      department?: string | null;
      machine_model?: string | null;
      machine_serial?: string | null;
      part_number?: string | null;
      warranty?: boolean | null;
      quantity?: number | null;
      category?: ClaimCategory | null;
      description?: string | null;
      visma_order_no?: string | null;
      customer_po?: string | null;
      reported_by?: string | null;
      internal_note?: string | null;
      status?: ClaimStatus | null;
      account_code_id?: number | null;
      technician_id?: string | null;
      salesperson_id?: string | null;
      root_cause?: string | null;
      corrective_action?: string | null;
      preventive_action?: string | null;
      action_owner?: string | null;
      action_due_date?: string | null;
      action_status?: ActionStatus | null;
      action_completed_at?: string | null;
      action_effectiveness?: string | null;
    }) => {
      return withRetry(async () => {
        const { id, ...updateData } = data;
        
        console.log('useEditClaim mutationFn - Update data:', updateData);
        
        const { data: result, error } = await supabase
          .from('claims')
          .update(updateData)
          .eq('id', id)
          .is('deleted_at', null)
          .select()
          .single();
        
        if (error) {
          console.error('Supabase update error:', error);
          handleSupabaseError(error, 'oppdatere reklamasjon');
          throw error;
        }
        
        console.log('useEditClaim mutationFn - Update successful:', result);
        return result;
      });
    },
    onSuccess: (data) => {
      console.log('useEditClaim onSuccess - Updated data:', data);
      queryClient.invalidateQueries({ queryKey: ['claim', data.id] });
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      toast({
        title: "Reklamasjon oppdatert",
        description: "Endringene har blitt lagret.",
      });
    },
    onError: (error) => {
      console.error('useEditClaim onError:', error);
    }
  });
}
