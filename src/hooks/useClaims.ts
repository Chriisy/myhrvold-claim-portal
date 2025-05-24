
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ClaimFormData } from '@/lib/validations/claim';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const useCreateClaim = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (claimData: ClaimFormData) => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('claims')
        .insert({
          ...claimData,
          created_by: user.id,
          source: 'wizard',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      toast({
        title: 'Reklamasjon opprettet',
        description: 'Din reklamasjon har blitt registrert.',
      });
      navigate(`/claim/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: 'Feil',
        description: 'Kunne ikke opprette reklamasjon. Prøv igjen.',
        variant: 'destructive',
      });
      console.error('Error creating claim:', error);
    },
  });
};
