
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError, withRetry } from '@/utils/supabaseErrorHandler';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type ClaimCategory = Database['public']['Enums']['claim_category'];
type ClaimStatus = Database['public']['Enums']['claim_status'];

// Helper function to ensure valid status
const validateStatus = (status?: ClaimStatus | string | null): ClaimStatus => {
  const validStatuses: ClaimStatus[] = ['Ny', 'Avventer', 'Godkjent', 'Avslått', 'Bokført', 'Lukket'];
  
  console.log('validateStatus called with:', status, 'type:', typeof status);
  
  if (status && typeof status === 'string' && validStatuses.includes(status as ClaimStatus)) {
    console.log('Status is valid:', status);
    return status as ClaimStatus;
  }
  
  console.warn('Invalid status in useEditClaim, defaulting to "Ny". Original status was:', status);
  return 'Ny';
};

export function useEditClaim() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      customer_name?: string | null;
      customer_no?: string | null;
      customer_address?: string | null;
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
      status?: ClaimStatus | string | null;
      account_code_id?: number | null;
    }) => {
      return withRetry(async () => {
        const { id, ...updateData } = data;
        
        // Validate status before sending to database
        const validatedUpdateData = {
          ...updateData,
          status: validateStatus(updateData.status)
        };
        
        console.log('useEditClaim mutationFn - Original data:', data);
        console.log('useEditClaim mutationFn - Validated data:', validatedUpdateData);
        console.log('useEditClaim mutationFn - Status being sent:', validatedUpdateData.status);
        
        const { data: result, error } = await supabase
          .from('claims')
          .update(validatedUpdateData)
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
