
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ClaimCredit {
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

export const useClaimCredits = (claimId: string) => {
  return useQuery({
    queryKey: ['claim-credits', claimId],
    queryFn: async (): Promise<ClaimCredit[]> => {
      const { data, error } = await supabase
        .from('credit_note')
        .select('*')
        .eq('claim_id', claimId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching credits:', error);
        throw new Error(`Failed to fetch credits: ${error.message}`);
      }

      return data || [];
    },
    enabled: !!claimId,
  });
};

export const useAddClaimCredit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credit: Omit<ClaimCredit, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('credit_note')
        .insert(credit)
        .select()
        .single();

      if (error) {
        console.error('Error adding credit:', error);
        throw new Error(`Failed to add credit: ${error.message}`);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['claim-credits', data.claim_id] });
      queryClient.invalidateQueries({ queryKey: ['timeline', data.claim_id] });
      toast({
        title: 'Kreditnota lagt til',
        description: 'Kreditnotaen har blitt lagt til reklamasjonen.',
      });
    },
    onError: (error) => {
      console.error('Error adding credit:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke legge til kreditnota.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateClaimCredit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<ClaimCredit> & { id: string }) => {
      const { data, error } = await supabase
        .from('credit_note')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating credit:', error);
        throw new Error(`Failed to update credit: ${error.message}`);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['claim-credits', data.claim_id] });
      toast({
        title: 'Kreditnota oppdatert',
        description: 'Kreditnotaen har blitt oppdatert.',
      });
    },
    onError: (error) => {
      console.error('Error updating credit:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke oppdatere kreditnota.',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteClaimCredit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, claimId }: { id: string; claimId: string }) => {
      const { error } = await supabase
        .from('credit_note')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting credit:', error);
        throw new Error(`Failed to delete credit: ${error.message}`);
      }

      return { id, claimId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['claim-credits', data.claimId] });
      toast({
        title: 'Kreditnota slettet',
        description: 'Kreditnotaen har blitt slettet.',
      });
    },
    onError: (error) => {
      console.error('Error deleting credit:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke slette kreditnota.',
        variant: 'destructive',
      });
    },
  });
};
