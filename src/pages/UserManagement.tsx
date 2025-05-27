
import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Upload } from 'lucide-react';
import { useUsers, useUpdateUserRole, UserWithPermissions } from '@/hooks/useUsers';
import { EnhancedUserEditModal } from '@/components/user-management/EnhancedUserEditModal';
import { BulkUserActions } from '@/components/user-management/BulkUserActions';
import { BulkImportStep } from '@/components/user-management/BulkImportStep';
import { UserManagementHeader } from '@/components/user-management/UserManagementHeader';
import { UserStatsCards } from '@/components/user-management/UserStatsCards';
import { UserFilters } from '@/components/user-management/UserFilters';
import { CurrentUserInfo } from '@/components/user-management/CurrentUserInfo';
import { UserListTable } from '@/components/user-management/UserListTable';
import { useCreateAuditLog } from '@/hooks/useAuditLog';
import { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

type UserRole = Database['public']['Enums']['user_role'];

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrator',
  saksbehandler: 'Saksbehandler',
  tekniker: 'Tekniker',
  avdelingsleder: 'Avdelingsleder',
};

function UserManagementLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-8" />
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    </div>
  );
}

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

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    
    let filtered = users;

    if (searchQuery) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

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

  const handleImportComplete = () => {
    refetch();
    setSelectedUsers([]);
  };

  if (isLoading) {
    return <UserManagementLoading />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <UserManagementHeader />
      <UserStatsCards users={users || []} />

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
          <BulkImportStep onImportComplete={handleImportComplete} />
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <UserFilters 
            onSearch={setSearchQuery}
            roleFilter={roleFilter}
            onRoleFilterChange={setRoleFilter}
          />

          {selectedUsers.length > 0 && (
            <BulkUserActions
              selectedUsers={selectedUsers}
              onBulkRoleChange={handleBulkRoleChange}
              onSelectAll={handleSelectAll}
              totalUsers={filteredUsers.length}
            />
          )}

          <CurrentUserInfo />

          <UserListTable
            users={filteredUsers}
            selectedUsers={selectedUsers}
            onUserSelection={handleUserSelection}
            onEditUser={handleEditUser}
            searchQuery={searchQuery}
            totalUsers={users?.length || 0}
          />
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
