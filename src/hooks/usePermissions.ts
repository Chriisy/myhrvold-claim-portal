
import { useAuth } from '@/contexts/AuthContext';

export const usePermissions = () => {
  const { user, hasPermission } = useAuth();

  const canViewAllClaims = () => hasPermission('view_all_claims');
  const canEditAllClaims = () => hasPermission('edit_all_claims');
  const canDeleteClaims = () => hasPermission('delete_claims');
  const canManageUsers = () => hasPermission('manage_users');
  const canViewReports = () => hasPermission('view_reports');
  const canApproveClaims = () => hasPermission('approve_claims');
  const canViewDepartmentClaims = () => hasPermission('view_department_claims');
  const canEditOwnClaims = () => hasPermission('edit_own_claims');
  const canCreateClaims = () => hasPermission('create_claims');

  const isAdmin = () => user?.user_role === 'admin';
  const isSaksbehandler = () => user?.user_role === 'saksbehandler';
  const isTekniker = () => user?.user_role === 'tekniker';
  const isAvdelingsleder = () => user?.user_role === 'avdelingsleder';

  return {
    canViewAllClaims,
    canEditAllClaims,
    canDeleteClaims,
    canManageUsers,
    canViewReports,
    canApproveClaims,
    canViewDepartmentClaims,
    canEditOwnClaims,
    canCreateClaims,
    isAdmin,
    isSaksbehandler,
    isTekniker,
    isAvdelingsleder,
    user,
  };
};
