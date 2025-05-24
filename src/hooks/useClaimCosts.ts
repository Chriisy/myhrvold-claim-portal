
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useClaimCosts(claimIdOrNumber: string) {
  return useQuery({
    queryKey: ['costs', claimIdOrNumber],
    queryFn: async () => {
      // First, check if we're dealing with a UUID or a claim number
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(claimIdOrNumber);
      
      let actualClaimId = claimIdOrNumber;
      
      if (!isUUID) {
        // Look up the claim by identifier
        const { data: claimData, error: claimError } = await supabase
          .from('claims')
          .select('id')
          .eq('id', claimIdOrNumber)
          .single();
          
        if (claimError) {
          console.warn('Could not find claim with identifier:', claimIdOrNumber);
          return [];
        }
        
        actualClaimId = claimData.id;
      }
      
      const { data, error } = await supabase
        .from('cost_line')
        .select('*')
        .eq('claim_id', actualClaimId)
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
