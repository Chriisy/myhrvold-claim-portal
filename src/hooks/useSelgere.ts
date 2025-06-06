
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Dedicated hook for getting salespersons specifically for the claim system
export const useSelgere = () => {
  return useQuery({
    queryKey: ['selgere'],
    queryFn: async () => {
      console.log('useSelgere - Fetching all users from database...');
      
      const { data, error } = await supabase
        .from('users')
        .select('id, name, user_role, department, seller_no, role')
        .order('name');

      if (error) {
        console.error('useSelgere - Database error:', error);
        throw error;
      }

      console.log('useSelgere - Raw data from database:', data);
      console.log('useSelgere - Total users fetched:', data?.length || 0);
      
      if (data) {
        data.forEach(user => {
          console.log(`useSelgere - User: ${user.name}, user_role: ${user.user_role}, role: ${user.role}, seller_no: ${user.seller_no}`);
        });
      }

      // Allow ALL users to be selectable as salespersons - remove restrictive filtering
      const filtered = (data || []);
      
      console.log('useSelgere - Filtered selgere:', filtered);
      console.log('useSelgere - Filtered count:', filtered.length);

      return filtered;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
