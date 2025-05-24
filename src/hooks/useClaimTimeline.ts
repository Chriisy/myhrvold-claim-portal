
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useClaimTimeline(claimIdOrNumber: string) {
  return useQuery({
    queryKey: ['timeline', claimIdOrNumber],
    queryFn: async () => {
      // First, check if we're dealing with a UUID or a claim number
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(claimIdOrNumber);
      
      let actualClaimId = claimIdOrNumber;
      
      if (!isUUID) {
        // Look up the claim by a claim number field - assuming you have one
        // Since I don't see a claim_number field in your schema, I'll use the id field directly
        // You might need to adjust this based on your actual claim number field
        const { data: claimData, error: claimError } = await supabase
          .from('claims')
          .select('id')
          .eq('id', claimIdOrNumber)
          .single();
          
        if (claimError) {
          // If direct lookup fails, this might be a display number - return empty array for now
          console.warn('Could not find claim with identifier:', claimIdOrNumber);
          return [];
        }
        
        actualClaimId = claimData.id;
      }
      
      const { data, error } = await supabase
        .from('timeline_item')
        .select('*')
        .eq('claim_id', actualClaimId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });
}
