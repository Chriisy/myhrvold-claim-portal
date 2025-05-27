
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

      // More inclusive filtering - allow more users to be selectable as salespersons
      const filtered = (data || []).filter(user => 
        user.seller_no || // Anyone with a seller number
        user.role === 'salesperson' || 
        user.user_role === 'saksbehandler' || 
        user.user_role === 'avdelingsleder' ||
        user.user_role === 'admin' ||
        user.role === 'admin' ||
        user.user_role === 'tekniker' || // Allow technicians to also be selectable as salespersons
        user.role === 'technician'
      );
      
      console.log('useSelgere - Filtered selgere:', filtered);
      console.log('useSelgere - Filtered count:', filtered.length);

      return filtered;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
