import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pencil, Shield, Users, AlertCircle, CheckCircle, Plus, Filter, Upload } from 'lucide-react';
import { useUsers, useUpdateUserRole, UserWithPermissions } from '@/hooks/useUsers';
import { EnhancedUserEditModal } from '@/components/user-management/EnhancedUserEditModal';
import { UserSearchBar } from '@/components/user-management/UserSearchBar';
import { BulkUserActions } from '@/components/user-management/BulkUserActions';
import { BulkUserImport } from '@/components/user-management/BulkUserImport';
import { UserStatusIndicator } from '@/components/user-management/UserStatusIndicator';
import { useCreateAuditLog } from '@/hooks/useAuditLog';
import { Database } from '@/integrations/supabase/types';
import { getDepartmentLabel } from '@/lib/constants/departments';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

type UserRole = Database['public']['Enums']['user_role'];

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrator',
  saksbehandler: 'Saksbehandler',
  tekniker: 'Tekniker',
  avdelingsleder: 'Avdelingsleder',
};

const UserManagement = () => {
  const { data: users, isLoading, refetch } = useUsers();
  const { user: currentUser } = useAuth();
  const [selectedUser, setSelectedUser] = useState<UserWithPermissions | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<UserWithPermissions[]>([]);
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');

  const updateUserRole = useUpdateUserRole();
  const createAuditLog = useCreateAuditLog();

  // Filtrer brukere basert på søk og rolle
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    
    let filtered = users;

    // Søkefilter
    if (searchQuery) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Rollefilter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.user_role === roleFilter);
    }

    return filtered;
  }, [users, searchQuery, roleFilter]);

  const handleEditUser = (user: UserWithPermissions) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleUserSelection = (user: UserWithPermissions, selected: boolean) => {
    if (selected) {
      setSelectedUsers(prev => [...prev, user]);
    } else {
      setSelectedUsers(prev => prev.filter(u => u.id !== user.id));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedUsers(filteredUsers);
    } else {
      setSelectedUsers([]);
    }
  };

  const handleBulkRoleChange = async (userIds: string[], newRole: UserRole) => {
    try {
      for (const userId of userIds) {
        const user = users?.find(u => u.id === userId);
        if (user) {
          await updateUserRole.mutateAsync({
            userId,
            role: newRole,
            department: user.department,
          });

          await createAuditLog.mutateAsync({
            action: 'bulk_role_change',
            tableName: 'users',
            recordId: userId,
            oldValues: { role: user.user_role },
            newValues: { role: newRole },
          });
        }
      }

      toast({
        title: 'Roller oppdatert',
        description: `${userIds.length} brukere har fått oppdatert rolle til ${roleLabels[newRole]}.`,
      });

      setSelectedUsers([]);
    } catch (error) {
      console.error('Error updating roles:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke oppdatere roller.',
        variant: 'destructive',
      });
    }
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

  const handleImportComplete = () => {
    refetch();
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

      {/* Statistikk-kort */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{users?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Totale brukere</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{users?.filter(u => u.user_role === 'admin').length || 0}</div>
            <p className="text-xs text-muted-foreground">Administratorer</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{users?.filter(u => u.user_role === 'saksbehandler').length || 0}</div>
            <p className="text-xs text-muted-foreground">Saksbehandlere</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{users?.filter(u => u.user_role === 'tekniker').length || 0}</div>
            <p className="text-xs text-muted-foreground">Teknikere</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for import og administrasjon */}
      <Tabs defaultValue="manage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Administrer brukere
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Importer brukere
          </TabsTrigger>
        </TabsList>

        <TabsContent value="import">
          <BulkUserImport onImportComplete={handleImportComplete} />
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          {/* Søk og filter */}
          <Card>
            <CardHeader>
              <CardTitle>Søk og filtrer brukere</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 flex-wrap">
                <UserSearchBar onSearch={setSearchQuery} />
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
                    className="border rounded px-3 py-2 text-sm"
                  >
                    <option value="all">Alle roller</option>
                    <option value="admin">Administrator</option>
                    <option value="saksbehandler">Saksbehandler</option>
                    <option value="avdelingsleder">Avdelingsleder</option>
                    <option value="tekniker">Tekniker</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bulk-operasjoner */}
          {selectedUsers.length > 0 && (
            <BulkUserActions
              selectedUsers={selectedUsers}
              onBulkRoleChange={handleBulkRoleChange}
              onSelectAll={handleSelectAll}
              totalUsers={filteredUsers.length}
            />
          )}

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

          {/* Brukerliste */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {searchQuery ? `Søkeresultater (${filteredUsers.length})` : 'Alle brukere i systemet'}
                </div>
                <Badge variant="secondary">
                  {filteredUsers.length} av {users?.length || 0} brukere
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers?.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedUsers.some(u => u.id === user.id)}
                        onCheckedChange={(checked) => handleUserSelection(user, checked as boolean)}
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
                      onClick={() => handleEditUser(user)}
                      disabled={user.id === currentUser?.id && currentUser?.user_role !== 'admin'}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      {user.id === currentUser?.id ? 'Rediger profil' : 'Rediger'}
                    </Button>
                  </div>
                ))}

                {filteredUsers.length === 0 && searchQuery && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Ingen brukere funnet som matcher søket "{searchQuery}"</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EnhancedUserEditModal
        user={selectedUser}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
      />
    </div>
  );
};

export default UserManagement;
