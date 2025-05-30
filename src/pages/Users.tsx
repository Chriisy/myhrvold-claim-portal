
import React, { Suspense } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { OptimizedErrorBoundary } from '@/components/shared/OptimizedErrorBoundary';
import { OptimizedLoadingStates } from '@/components/shared/OptimizedLoadingStates';

const UserListTable = React.lazy(() => import('@/components/user-management/UserListTable'));
const UserManagementHeader = React.lazy(() => import('@/components/user-management/UserManagementHeader'));
const UserStatsCards = React.lazy(() => import('@/components/user-management/UserStatsCards'));

const Users = () => {
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
          <UserStatsCards />
        </Suspense>
      </OptimizedErrorBoundary>

      <OptimizedErrorBoundary>
        <Suspense fallback={<div className="h-4" />}>
          <UserManagementHeader />
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

export default Users;
