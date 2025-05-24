
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ClaimFormData } from '@/lib/validations/claim';
import { handleSupabaseError, withRetry } from '@/utils/supabaseErrorHandler';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const useCreateClaim = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (claimData: ClaimFormData) => {
      return withRetry(async () => {
        // Verify authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (!user || authError) {
          throw new Error('Du må være innlogget for å opprette reklamasjoner');
        }

        const { data, error } = await supabase
          .from('claims')
          .insert({
            ...claimData,
            created_by: user.id,
            source: 'wizard',
          })
          .select()
          .single();

        if (error) {
          handleSupabaseError(error, 'opprette reklamasjon');
          throw error;
        }
        
        return data;
      });
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
      console.error('Error creating claim:', error);
    },
  });
};
