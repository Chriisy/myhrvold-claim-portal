
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Shield, Users } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { UserEditModal } from '@/components/user-management/UserEditModal';
import { UserWithPermissions } from '@/hooks/useUsers';
import { Database } from '@/integrations/supabase/types';
import { getDepartmentLabel } from '@/lib/constants/departments';

type UserRole = Database['public']['Enums']['user_role'];

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrator',
  saksbehandler: 'Saksbehandler',
  tekniker: 'Tekniker',
  avdelingsleder: 'Avdelingsleder',
};

const UserManagement = () => {
  const { data: users, isLoading } = useUsers();
  const [selectedUser, setSelectedUser] = useState<UserWithPermissions | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const handleEditUser = (user: UserWithPermissions) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'avdelingsleder':
        return 'default';
      case 'saksbehandler':
        return 'secondary';
      case 'tekniker':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-myhrvold-primary">Brukeradministrasjon</h1>
            <p className="text-gray-600">Laster brukere...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-myhrvold-primary" />
          <div>
            <h1 className="text-3xl font-bold text-myhrvold-primary">Brukeradministrasjon</h1>
            <p className="text-gray-600">Administrer brukere, roller og tillatelser</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Brukeroversikt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users?.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{user.name}</h3>
                      <Badge variant={getRoleBadgeVariant(user.user_role)}>
                        {roleLabels[user.user_role]}
                      </Badge>
                      <Badge variant="outline">
                        {getDepartmentLabel(user.department)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    {user.permissions && user.permissions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {user.permissions.slice(0, 3).map((permission) => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission.replace('_', ' ')}
                          </Badge>
                        ))}
                        {user.permissions.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{user.permissions.length - 3} flere
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditUser(user)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Rediger
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <UserEditModal
        user={selectedUser}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
      />
    </div>
  );
};

export default UserManagement;
