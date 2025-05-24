
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useClaimCredits(claimId: string) {
  return useQuery({
    queryKey: ['credits', claimId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('credit_note')
        .select('*')
        .eq('claim_id', claimId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });
}

export function useAddCreditNote() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      claim_id: string;
      description: string;
      amount: number;
      konto_nr?: number;
      voucher_no?: string;
    }) => {
      const { data: result, error } = await supabase
        .from('credit_note')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['credits', variables.claim_id] });
      toast({
        title: "Kreditnota lagt til",
        description: "Kreditnotaen har blitt registrert.",
      });
    },
    onError: (error) => {
      toast({
        title: "Feil",
        description: "Kunne ikke legge til kreditnota.",
        variant: "destructive",
      });
    }
  });
}
