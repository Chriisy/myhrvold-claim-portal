
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useClaimTimeline(claimId: string) {
  return useQuery({
    queryKey: ['timeline', claimId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('timeline_item')
        .select('*')
        .eq('claim_id', claimId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });
}
