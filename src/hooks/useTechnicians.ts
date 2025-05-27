
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryKeys';

export const useTechnicians = () => {
  return useQuery({
    queryKey: queryKeys.users.technicians(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, user_role, department, seller_no, role')
        .order('name');

      if (error) throw error;

      // Filter for users that could be technicians
      return (data || []).filter(user => 
        user.user_role === 'tekniker' || 
        user.role === 'technician' ||
        user.role === 'salesperson' // Some users can do both roles
      );
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for getting all users that can be assigned as salespersons
export const useSalespersons = () => {
  return useQuery({
    queryKey: ['salespersons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, user_role, department, seller_no, role')
        .order('name');

      if (error) throw error;

      // Filter for users that could be salespersons
      return (data || []).filter(user => 
        user.user_role === 'saksbehandler' || 
        user.user_role === 'avdelingsleder' || 
        user.user_role === 'admin' ||
        user.role === 'salesperson' ||
        user.seller_no // Anyone with a seller number
      );
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for getting ALL users (both technicians and salespersons) - useful for general user selection
export const useAllUsers = () => {
  return useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, user_role, department, seller_no, role')
        .order('name');

      if (error) throw error;

      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
