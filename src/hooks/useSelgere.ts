
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Dedicated hook for getting salespersons specifically for the claim system
export const useSelgere = () => {
  return useQuery({
    queryKey: ['selgere'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, user_role, department, seller_no, role')
        .order('name');

      if (error) throw error;

      // Include all users that could potentially be salespersons
      return (data || []).filter(user => 
        user.seller_no || // Anyone with a seller number
        user.role === 'salesperson' || 
        user.user_role === 'saksbehandler' || 
        user.user_role === 'avdelingsleder' ||
        user.user_role === 'admin'
      );
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
