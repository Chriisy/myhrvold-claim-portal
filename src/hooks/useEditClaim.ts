
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
      department?: string;
      machine_model?: string;
      machine_serial?: string;
      warranty?: boolean;
      quantity?: number;
      category?: ClaimCategory;
      description?: string;
      visma_order_no?: string;
      customer_po?: string;
      reported_by?: string;
      internal_note?: string;
      status?: ClaimStatus;
    }) => {
      const { id, ...updateData } = data;
      const { data: result, error } = await supabase
        .from('claims')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['claim', data.id] });
      toast({
        title: "Reklamasjon oppdatert",
        description: "Endringene har blitt lagret.",
      });
    },
    onError: (error) => {
      toast({
        title: "Feil",
        description: "Kunne ikke oppdatere reklamasjonen.",
        variant: "destructive",
      });
    }
  });
}
