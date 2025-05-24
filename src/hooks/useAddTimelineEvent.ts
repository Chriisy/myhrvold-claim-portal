
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useAddTimelineEvent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      claim_id: string;
      message: string;
      created_by: string;
    }) => {
      const { data: result, error } = await supabase
        .from('timeline_item')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['timeline', variables.claim_id] });
      toast({
        title: "Hendelse lagt til",
        description: "Tidslinjen har blitt oppdatert.",
      });
    },
    onError: (error) => {
      toast({
        title: "Feil",
        description: "Kunne ikke legge til hendelse.",
        variant: "destructive",
      });
    }
  });
}
