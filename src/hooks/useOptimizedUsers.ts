
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];
type Department = Database['public']['Enums']['department'];
type PermissionType = Database['public']['Enums']['permission_type'];

export interface UserWithPermissions {
  id: string;
  name: string;
  email: string;
  role: string; // Added missing role property
  user_role: UserRole;
  department: Department;
  created_at: string;
  seller_no?: number;
  permissions?: PermissionType[];
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
          user_role: user.user_role as UserRole, // Ensure proper typing
          department: user.department as Department, // Ensure proper typing
          permissions: (permissionsByUser[user.id] || []) as PermissionType[]
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
