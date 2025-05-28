
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ClaimCost {
  id: string;
  claim_id: string;
  description: string;
  amount: number;
  date: string;
  voucher_no?: string;
  konto_nr?: number;
  source: string;
  created_at: string;
}

export const useClaimCosts = (claimId: string) => {
  return useQuery({
    queryKey: ['claim-costs', claimId],
    queryFn: async (): Promise<ClaimCost[]> => {
      const { data, error } = await supabase
        .from('cost_line')
        .select('*')
        .eq('claim_id', claimId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching costs:', error);
        throw new Error(`Failed to fetch costs: ${error.message}`);
      }

      return data || [];
    },
    enabled: !!claimId,
  });
};

export const useAddClaimCost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cost: Omit<ClaimCost, 'id' | 'created_at'>) => {
      // First add the cost
      const { data: costData, error: costError } = await supabase
        .from('cost_line')
        .insert(cost)
        .select()
        .single();

      if (costError) {
        console.error('Error adding cost:', costError);
        throw new Error(`Failed to add cost: ${costError.message}`);
      }

      // Automatically create a corresponding credit note
      const creditData = {
        claim_id: cost.claim_id,
        description: `Automatisk kreditnota for: ${cost.description}`,
        amount: cost.amount,
        date: cost.date,
        voucher_no: cost.voucher_no,
        konto_nr: cost.konto_nr,
        source: 'auto_from_cost' as const,
      };

      const { error: creditError } = await supabase
        .from('credit_note')
        .insert(creditData);

      if (creditError) {
        console.error('Error adding automatic credit note:', creditError);
        // Don't throw error here, as the cost was successfully added
        toast({
          title: 'Advarsel',
          description: 'Kostnad lagt til, men automatisk kreditnota kunne ikke opprettes.',
          variant: 'destructive',
        });
      }

      return costData;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['claim-costs', data.claim_id] });
      queryClient.invalidateQueries({ queryKey: ['claim-credits', data.claim_id] });
      queryClient.invalidateQueries({ queryKey: ['timeline', data.claim_id] });
      toast({
        title: 'Kostnad lagt til',
        description: 'Kostnaden og tilhørende kreditnota har blitt opprettet.',
      });
    },
    onError: (error) => {
      console.error('Error adding cost:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke legge til kostnad.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateClaimCost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<ClaimCost> & { id: string }) => {
      const { data, error } = await supabase
        .from('cost_line')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating cost:', error);
        throw new Error(`Failed to update cost: ${error.message}`);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['claim-costs', data.claim_id] });
      toast({
        title: 'Kostnad oppdatert',
        description: 'Kostnaden har blitt oppdatert.',
      });
    },
    onError: (error) => {
      console.error('Error updating cost:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke oppdatere kostnad.',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteClaimCost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, claimId }: { id: string; claimId: string }) => {
      const { error } = await supabase
        .from('cost_line')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting cost:', error);
        throw new Error(`Failed to delete cost: ${error.message}`);
      }

      return { id, claimId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['claim-costs', data.claimId] });
      toast({
        title: 'Kostnad slettet',
        description: 'Kostnaden har blitt slettet.',
      });
    },
    onError: (error) => {
      console.error('Error deleting cost:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke slette kostnad.',
        variant: 'destructive',
      });
    },
  });
};

