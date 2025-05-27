
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
        .order('name');

      if (error) throw error;

      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// New hook specifically for getting all users that can be assigned as salespersons
// Using only valid user_role enum values
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
