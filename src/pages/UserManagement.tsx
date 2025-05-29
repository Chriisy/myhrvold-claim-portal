
import React, { Suspense } from 'react';
import { OptimizedErrorBoundary } from '@/components/shared/OptimizedErrorBoundary';
import { OptimizedLoadingStates } from '@/components/shared/OptimizedLoadingStates';

// Lazy load components with correct import syntax for named exports
const UserManagementHeader = React.lazy(() => import('@/components/user-management/UserManagementHeader').then(module => ({ default: module.UserManagementHeader })));
const UserStatsCards = React.lazy(() => import('@/components/user-management/UserStatsCards').then(module => ({ default: module.UserStatsCards })));
const UserFilters = React.lazy(() => import('@/components/user-management/UserFilters').then(module => ({ default: module.UserFilters })));
const UserListTable = React.lazy(() => import('@/components/user-management/UserListTable').then(module => ({ default: module.UserListTable })));

const UserManagement = () => {
  return (
    <div className="p-6 space-y-6">
      <OptimizedErrorBoundary>
        <Suspense fallback={<div className="h-16" />}>
          <UserManagementHeader />
        </Suspense>
      </OptimizedErrorBoundary>

      <OptimizedErrorBoundary>
        <Suspense fallback={<OptimizedLoadingStates.Cards />}>
          <UserStatsCards />
        </Suspense>
      </OptimizedErrorBoundary>

      <OptimizedErrorBoundary>
        <Suspense fallback={<OptimizedLoadingStates.Form />}>
          <UserFilters />
        </Suspense>
      </OptimizedErrorBoundary>

      <OptimizedErrorBoundary>
        <Suspense fallback={<OptimizedLoadingStates.Table />}>
          <UserListTable />
        </Suspense>
      </OptimizedErrorBoundary>
    </div>
  );
};

export default UserManagement;
