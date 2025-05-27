
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryKeys';

export const useTechnicians = () => {
  return useQuery({
    queryKey: queryKeys.users.technicians(),
    queryFn: async () => {
      console.log('useTechnicians - Fetching all users from database...');
      
      const { data, error } = await supabase
        .from('users')
        .select('id, name, user_role, department, seller_no, role')
        .order('name');

      if (error) {
        console.error('useTechnicians - Database error:', error);
        throw error;
      }

      console.log('useTechnicians - Raw data from database:', data);
      console.log('useTechnicians - Total users fetched:', data?.length || 0);
      
      if (data) {
        data.forEach(user => {
          console.log(`useTechnicians - User: ${user.name}, user_role: ${user.user_role}, role: ${user.role}`);
        });
      }

      // Allow ALL users to be selectable as technicians - remove restrictive filtering
      const filtered = (data || []);
      
      console.log('useTechnicians - Filtered technicians:', filtered);
      console.log('useTechnicians - Filtered count:', filtered.length);

      return filtered;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for getting all users that can be assigned as salespersons
export const useSalespersons = () => {
  return useQuery({
    queryKey: ['salespersons'],
    queryFn: async () => {
      console.log('useSalespersons - Fetching all users from database...');
      
      const { data, error } = await supabase
        .from('users')
        .select('id, name, user_role, department, seller_no, role')
        .order('name');

      if (error) {
        console.error('useSalespersons - Database error:', error);
        throw error;
      }

      console.log('useSalespersons - Raw data from database:', data);
      console.log('useSalespersons - Total users fetched:', data?.length || 0);
      
      if (data) {
        data.forEach(user => {
          console.log(`useSalespersons - User: ${user.name}, user_role: ${user.user_role}, role: ${user.role}, seller_no: ${user.seller_no}`);
        });
      }

      // Allow ALL users to be selectable as salespersons - remove restrictive filtering
      const filtered = (data || []);
      
      console.log('useSalespersons - Filtered salespersons:', filtered);
      console.log('useSalespersons - Filtered count:', filtered.length);

      return filtered;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for getting ALL users (both technicians and salespersons) - useful for general user selection
export const useAllUsers = () => {
  return useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      console.log('useAllUsers - Fetching all users from database...');
      
      const { data, error } = await supabase
        .from('users')
        .select('id, name, user_role, department, seller_no, role')
        .order('name');

      if (error) {
        console.error('useAllUsers - Database error:', error);
        throw error;
      }

      console.log('useAllUsers - Raw data from database:', data);
      console.log('useAllUsers - Total users fetched:', data?.length || 0);

      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
