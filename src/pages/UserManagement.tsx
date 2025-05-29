
import React, { Suspense } from 'react';
import { OptimizedErrorBoundary } from '@/components/shared/OptimizedErrorBoundary';
import { OptimizedLoadingStates } from '@/components/shared/OptimizedLoadingStates';

// Lazy load components
const UserManagementHeader = React.lazy(() => import('@/components/user-management/UserManagementHeader'));
const UserStatsCards = React.lazy(() => import('@/components/user-management/UserStatsCards'));
const UserFilters = React.lazy(() => import('@/components/user-management/UserFilters'));
const UserListTable = React.lazy(() => import('@/components/user-management/UserListTable'));

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
