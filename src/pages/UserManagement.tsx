
import React, { Suspense, useState } from 'react';
import { OptimizedErrorBoundary } from '@/components/shared/OptimizedErrorBoundary';
import { OptimizedLoadingStates } from '@/components/shared/OptimizedLoadingStates';
import { useOptimizedUsers } from '@/hooks/useOptimizedUsers';
import { UserWithPermissions } from '@/hooks/useUsers';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

// Lazy load components with correct import syntax for named exports
const UserManagementHeader = React.lazy(() => import('@/components/user-management/UserManagementHeader').then(module => ({ default: module.UserManagementHeader })));
const UserStatsCards = React.lazy(() => import('@/components/user-management/UserStatsCards').then(module => ({ default: module.UserStatsCards })));
const UserFilters = React.lazy(() => import('@/components/user-management/UserFilters').then(module => ({ default: module.UserFilters })));
const UserListTable = React.lazy(() => import('@/components/user-management/UserListTable').then(module => ({ default: module.UserListTable })));

const UserManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [selectedUsers, setSelectedUsers] = useState<UserWithPermissions[]>([]);

  const { data: users = [], isLoading } = useOptimizedUsers();

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery || 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.user_role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const handleUserSelection = (user: UserWithPermissions, selected: boolean) => {
    if (selected) {
      setSelectedUsers(prev => [...prev, user]);
    } else {
      setSelectedUsers(prev => prev.filter(u => u.id !== user.id));
    }
  };

  const handleEditUser = (user: UserWithPermissions) => {
    // Handle edit user functionality
    console.log('Edit user:', user);
  };

  return (
    <div className="p-6 space-y-6">
      <OptimizedErrorBoundary>
        <Suspense fallback={<div className="h-16" />}>
          <UserManagementHeader />
        </Suspense>
      </OptimizedErrorBoundary>

      <OptimizedErrorBoundary>
        <Suspense fallback={<OptimizedLoadingStates.Cards />}>
          <UserStatsCards users={filteredUsers} />
        </Suspense>
      </OptimizedErrorBoundary>

      <OptimizedErrorBoundary>
        <Suspense fallback={<OptimizedLoadingStates.Form />}>
          <UserFilters 
            onSearch={setSearchQuery}
            roleFilter={roleFilter}
            onRoleFilterChange={setRoleFilter}
          />
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

export default UserManagement;
