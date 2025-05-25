
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from '@/hooks/use-toast';

type UserRole = Database['public']['Enums']['user_role'];
type Department = Database['public']['Enums']['department'];
type PermissionType = Database['public']['Enums']['permission_type'];

export interface UserWithPermissions {
  id: string;
  name: string;
  email: string;
  role: string;
  user_role: UserRole;
  department: Department;
  seller_no?: number;
  created_at: string;
  permissions?: PermissionType[];
}

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          user_permissions(permission_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(user => ({
        ...user,
        permissions: user.user_permissions?.map(p => p.permission_name) || []
      })) as UserWithPermissions[];
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role, department, sellerNo }: { 
      userId: string; 
      role: UserRole; 
      department: Department;
      sellerNo?: number;
    }) => {
      const updateData: any = { user_role: role, department };
      if (sellerNo !== undefined) {
        updateData.seller_no = sellerNo;
      }

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Bruker oppdatert',
        description: 'Brukerens rolle og avdeling har blitt oppdatert.',
      });
    },
    onError: (error) => {
      console.error('Error updating user:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke oppdatere brukeren.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateUserPermissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, permissions }: { 
      userId: string; 
      permissions: PermissionType[];
    }) => {
      // First, delete existing permissions
      await supabase
        .from('user_permissions')
        .delete()
        .eq('user_id', userId);

      // Then insert new permissions
      if (permissions.length > 0) {
        const { error } = await supabase
          .from('user_permissions')
          .insert(
            permissions.map(permission => ({
              user_id: userId,
              permission_name: permission,
            }))
          );

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Tillatelser oppdatert',
        description: 'Brukerens tillatelser har blitt oppdatert.',
      });
    },
    onError: (error) => {
      console.error('Error updating permissions:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke oppdatere tillatelser.',
        variant: 'destructive',
      });
    },
  });
};
