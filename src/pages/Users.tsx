
import React, { Suspense, useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { OptimizedErrorBoundary } from '@/components/shared/OptimizedErrorBoundary';
import { OptimizedLoadingStates } from '@/components/shared/OptimizedLoadingStates';
import { useUsers } from '@/hooks/useUsers';
import { UserWithPermissions } from '@/hooks/useUsers';

const UserListTable = React.lazy(() => 
  import('@/components/user-management/UserListTable').then(module => ({ default: module.UserListTable }))
);
const UserManagementHeader = React.lazy(() => 
  import('@/components/user-management/UserManagementHeader').then(module => ({ default: module.UserManagementHeader }))
);
const UserStatsCards = React.lazy(() => 
  import('@/components/user-management/UserStatsCards').then(module => ({ default: module.UserStatsCards }))
);

const Users = () => {
  const [selectedUsers, setSelectedUsers] = useState<UserWithPermissions[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: users = [], isLoading, error } = useUsers();

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserSelection = (user: UserWithPermissions, selected: boolean) => {
    if (selected) {
      setSelectedUsers(prev => [...prev, user]);
    } else {
      setSelectedUsers(prev => prev.filter(u => u.id !== user.id));
    }
  };

  const handleEditUser = (user: UserWithPermissions) => {
    // Navigate to edit user modal or form
    console.log('Edit user:', user);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-myhrvold-primary">Brukere</h1>
            <p className="text-gray-600">Administrer brukere og tilgangskontroll</p>
          </div>
        </div>
        <OptimizedLoadingStates.Cards />
        <OptimizedLoadingStates.Table />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-myhrvold-primary">Brukere</h1>
            <p className="text-gray-600">Administrer brukere og tilgangskontroll</p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600">Feil ved lasting av brukere</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-3xl font-bold text-myhrvold-primary">Brukere</h1>
          <p className="text-gray-600">Administrer brukere og tilgangskontroll</p>
        </div>
      </div>

      <OptimizedErrorBoundary>
        <Suspense fallback={<OptimizedLoadingStates.Cards />}>
          <UserStatsCards users={users} />
        </Suspense>
      </OptimizedErrorBoundary>

      <OptimizedErrorBoundary>
        <Suspense fallback={<div className="h-4" />}>
          <UserManagementHeader />
        </Suspense>
      </OptimizedErrorBoundary>

      <OptimizedErrorBoundary>
        <Suspense fallback={<OptimizedLoadingStates.Table />}>
          <UserListTable
            users={filteredUsers}
            selectedUsers={selectedUsers}
            onUserSelection={handleUserSelection}
            onEditUser={handleEditUser}
            searchQuery={searchQuery}
            totalUsers={users.length}
          />
        </Suspense>
      </OptimizedErrorBoundary>
    </div>
  );
};

export default Users;
