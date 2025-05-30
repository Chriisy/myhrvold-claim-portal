
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ErrorService } from '@/services/errorHandling/errorService';

export const useOptimizedUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('name');

        if (error) throw error;
        return data || [];
      } catch (error) {
        ErrorService.handleSupabaseError(error as any, 'laste brukere', {
          component: 'useOptimizedUsers',
          severity: 'high'
        });
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => ErrorService.shouldRetryQuery(failureCount, error),
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (userData: any) => {
      try {
        const { data, error } = await supabase
          .from('users')
          .insert([userData])
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        ErrorService.handleSupabaseError(error as any, 'opprette bruker', {
          component: 'useCreateUser',
          severity: 'high'
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Bruker opprettet",
        description: "Brukeren er lagt til i systemet",
      });
    },
    onError: (error) => {
      console.error('Create user error:', error);
      toast({
        title: "Feil",
        description: "Kunne ikke opprette bruker",
        variant: "destructive"
      });
    }
  });
};
