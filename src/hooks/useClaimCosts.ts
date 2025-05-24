
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useClaimCosts(claimId: string) {
  return useQuery({
    queryKey: ['costs', claimId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cost_line')
        .select('*')
        .eq('claim_id', claimId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });
}

export function useAddCostLine() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      claim_id: string;
      description: string;
      amount: number;
      konto_nr?: number;
    }) => {
      const { data: result, error } = await supabase
        .from('cost_line')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['costs', variables.claim_id] });
      toast({
        title: "Kostnad lagt til",
        description: "Kostnaden har blitt registrert.",
      });
    },
    onError: (error) => {
      toast({
        title: "Feil",
        description: "Kunne ikke legge til kostnad.",
        variant: "destructive",
      });
    }
  });
}
