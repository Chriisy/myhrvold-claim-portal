
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Shield, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { UserEditModal } from '@/components/user-management/UserEditModal';
import { UserWithPermissions } from '@/hooks/useUsers';
import { Database } from '@/integrations/supabase/types';
import { getDepartmentLabel } from '@/lib/constants/departments';
import { useAuth } from '@/contexts/AuthContext';

type UserRole = Database['public']['Enums']['user_role'];

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrator',
  saksbehandler: 'Saksbehandler',
  tekniker: 'Tekniker',
  avdelingsleder: 'Avdelingsleder',
};

const UserManagement = () => {
  const { data: users, isLoading } = useUsers();
  const { user: currentUser } = useAuth();
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

  const getPermissionCount = (permissions: string[] | undefined) => {
    return permissions?.length || 0;
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

      {/* Informasjonspanel for nåværende bruker */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <AlertCircle className="h-5 w-5" />
            Din brukerinformasjon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{currentUser?.name}</p>
              <p className="text-sm text-gray-600">{currentUser?.email}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant={getRoleBadgeVariant(currentUser?.user_role || 'tekniker')}>
                  {roleLabels[currentUser?.user_role || 'tekniker']}
                </Badge>
                <Badge variant="outline">
                  {getDepartmentLabel(currentUser?.department || 'oslo')}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Rolle: {roleLabels[currentUser?.user_role || 'tekniker']}</p>
              <p className="text-sm text-gray-600">Avdeling: {getDepartmentLabel(currentUser?.department || 'oslo')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Oversikt over alle brukere */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Alle brukere i systemet
            </div>
            <Badge variant="secondary">
              {users?.length || 0} brukere totalt
            </Badge>
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
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{user.email}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Opprettet: {new Date(user.created_at).toLocaleDateString('nb-NO')}</span>
                    <span>Tillatelser: {getPermissionCount(user.permissions)}</span>
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditUser(user)}
                  disabled={user.id === currentUser?.id && currentUser?.user_role !== 'admin'}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  {user.id === currentUser?.id ? 'Rediger profil' : 'Rediger'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <UserEditModal
        user={selectedUser}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
      />
    </div>
  );
};

export default UserManagement;
