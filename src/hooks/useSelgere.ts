
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
        .in('role', ['salesperson', 'technician']) // Include both since some can do both roles
        .order('name');

      if (error) throw error;

      // Filter to only show users that have seller numbers or are marked as salespersons
      return (data || []).filter(user => 
        user.seller_no || 
        user.role === 'salesperson' || 
        user.user_role === 'saksbehandler' || 
        user.user_role === 'avdelingsleder' ||
        user.user_role === 'admin'
      );
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
