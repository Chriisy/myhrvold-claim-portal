
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const usePhotoCount = (checklistId?: string) => {
  return useQuery({
    queryKey: ['checklist-photo-count', checklistId],
    queryFn: async () => {
      if (!checklistId) return {};
      
      const { data, error } = await supabase
        .from('installation_checklist_photos')
        .select('checklist_item_id')
        .eq('checklist_id', checklistId);
      
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data.forEach(photo => {
        counts[photo.checklist_item_id] = (counts[photo.checklist_item_id] || 0) + 1;
      });
      
      return counts;
    },
    enabled: !!checklistId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
