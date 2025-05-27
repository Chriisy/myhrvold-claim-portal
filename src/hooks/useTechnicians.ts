
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryKeys';

export const useTechnicians = () => {
  return useQuery({
    queryKey: queryKeys.users.technicians(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, user_role, department, seller_no')
        .in('user_role', ['tekniker', 'montør'])
        .order('name');

      if (error) throw error;

      return data || [];
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
        .select('id, name, user_role, department, seller_no')
        .in('user_role', ['saksbehandler', 'avdelingsleder', 'admin'])
        .order('name');

      if (error) throw error;

      return data || [];
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
        .select('id, name, user_role, department, seller_no')
        .order('name');

      if (error) throw error;

      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
