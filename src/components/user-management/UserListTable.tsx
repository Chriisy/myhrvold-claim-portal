
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Pencil, CheckCircle } from 'lucide-react';
import { UserWithPermissions } from '@/hooks/useUsers';
import { UserStatusIndicator } from './UserStatusIndicator';
import { EnhancedUserEditModal } from './EnhancedUserEditModal';
import { useAuth } from '@/contexts/AuthContext';
import { getDepartmentLabel } from '@/lib/constants/departments';
import { Database } from '@/integrations/supabase/types';
import { memo, useState } from 'react';

type UserRole = Database['public']['Enums']['user_role'];

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrator',
  saksbehandler: 'Saksbehandler',
  tekniker: 'Tekniker',
  avdelingsleder: 'Avdelingsleder',
};

const getRoleBadgeVariant = (role: UserRole) => {
  switch (role) {
    case 'admin':
      return 'destructive' as const;
    case 'avdelingsleder':
      return 'default' as const;
    case 'saksbehandler':
      return 'secondary' as const;
    case 'tekniker':
      return 'outline' as const;
    default:
      return 'outline' as const;
  }
};

interface UserListTableProps {
  users: UserWithPermissions[];
  selectedUsers: UserWithPermissions[];
  onUserSelection: (user: UserWithPermissions, selected: boolean) => void;
  onEditUser: (user: UserWithPermissions) => void;
  searchQuery: string;
  totalUsers: number;
}

export const UserListTable = memo(({ 
  users, 
  selectedUsers, 
  onUserSelection, 
  onEditUser, 
  searchQuery, 
  totalUsers 
}: UserListTableProps) => {
  const { user: currentUser } = useAuth();
  const [editingUser, setEditingUser] = useState<UserWithPermissions | null>(null);

  const getPermissionCount = (permissions: string[] | undefined) => {
    return permissions?.length || 0;
  };

  const handleEditClick = (user: UserWithPermissions) => {
    console.log('Edit button clicked for user:', user);
    setEditingUser(user);
    onEditUser(user);
  };

  const handleModalClose = () => {
    setEditingUser(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {searchQuery ? `Søkeresultater (${users.length})` : 'Alle brukere i systemet'}
            </div>
            <Badge variant="secondary">
              {users.length} av {totalUsers} brukere
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedUsers.some(u => u.id === user.id)}
                    onCheckedChange={(checked) => onUserSelection(user, checked as boolean)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{user.name}</h3>
                      {user.id === currentUser?.id && (
                        <Badge variant="outline" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Du
                        </Badge>
                      )}
                      <Badge variant={getRoleBadgeVariant(user.user_role)}>
                        {roleLabels[user.user_role]}
                      </Badge>
                      <Badge variant="outline">
                        {getDepartmentLabel(user.department)}
                      </Badge>
                      <UserStatusIndicator createdAt={user.created_at} />
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{user.email}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Opprettet: {new Date(user.created_at).toLocaleDateString('nb-NO')}</span>
                      <span>Tillatelser: {getPermissionCount(user.permissions)}</span>
                      {user.seller_no && <span>Selger: {user.seller_no}</span>}
                      {user.permissions && user.permissions.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {user.permissions.slice(0, 2).map((permission) => (
                            <Badge key={permission} variant="outline" className="text-xs">
                              {permission.replace('_', ' ')}
                            </Badge>
                          ))}
                          {user.permissions.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{user.permissions.length - 2} flere
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditClick(user)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  {user.id === currentUser?.id ? 'Rediger profil' : 'Rediger'}
                </Button>
              </div>
            ))}

            {users.length === 0 && searchQuery && (
              <div className="text-center py-8">
                <p className="text-gray-500">Ingen brukere funnet som matcher søket "{searchQuery}"</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <EnhancedUserEditModal
        user={editingUser}
        open={!!editingUser}
        onOpenChange={handleModalClose}
      />
    </>
  );
});

UserListTable.displayName = 'UserListTable';
