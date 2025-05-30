
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface UserWithPermissions {
  id: string;
  name: string;
  email: string;
  role: string; // Added missing role property
  user_role: string;
  department: string;
  created_at: string;
  seller_no?: number;
  permissions?: string[];
}

export const useOptimizedUsers = () => {
  return useQuery({
    queryKey: ['optimized-users'],
    queryFn: async (): Promise<UserWithPermissions[]> => {
      try {
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('*')
          .order('name');

        if (usersError) {
          console.error('Error fetching users:', usersError);
          throw usersError;
        }

        // Fetch permissions for all users
        const { data: permissions, error: permissionsError } = await supabase
          .from('user_permissions')
          .select('user_id, permission_name');

        if (permissionsError) {
          console.error('Error fetching permissions:', permissionsError);
          // Don't throw here, just log and continue without permissions
        }

        // Map permissions to users
        const permissionsByUser = permissions?.reduce((acc, perm) => {
          if (!acc[perm.user_id]) {
            acc[perm.user_id] = [];
          }
          acc[perm.user_id].push(perm.permission_name);
          return acc;
        }, {} as Record<string, string[]>) || {};

        return (users || []).map(user => ({
          ...user,
          role: user.role || user.user_role, // Map role property to ensure compatibility
          permissions: permissionsByUser[user.id] || []
        }));
      } catch (error) {
        console.error('Error in useOptimizedUsers:', error);
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};
