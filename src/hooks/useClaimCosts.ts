
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
      const { data, error } = await supabase
        .from('cost_line')
        .insert(cost)
        .select()
        .single();

      if (error) {
        console.error('Error adding cost:', error);
        throw new Error(`Failed to add cost: ${error.message}`);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['claim-costs', data.claim_id] });
      queryClient.invalidateQueries({ queryKey: ['timeline', data.claim_id] });
      toast({
        title: 'Kostnad lagt til',
        description: 'Kostnaden har blitt lagt til reklamasjonen.',
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
