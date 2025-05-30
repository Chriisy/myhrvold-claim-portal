
import React, { Suspense } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { OptimizedErrorBoundary } from '@/components/shared/OptimizedErrorBoundary';
import { OptimizedLoadingStates } from '@/components/shared/OptimizedLoadingStates';

const ClaimsListTable = React.lazy(() => 
  import('@/components/claims/ClaimsListTable').then(module => ({ default: module.ClaimsListTable }))
);
const ClaimsListFilters = React.lazy(() => 
  import('@/components/claims/ClaimsListFilters').then(module => ({ default: module.ClaimsListFilters }))
);

const ClaimsList = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-3xl font-bold text-myhrvold-primary">Reklamasjoner</h1>
          <p className="text-gray-600">Administrer alle reklamasjoner og oppfølging</p>
        </div>
      </div>

      <OptimizedErrorBoundary>
        <Suspense fallback={<OptimizedLoadingStates.Table />}>
          <ClaimsListFilters />
        </Suspense>
      </OptimizedErrorBoundary>

      <OptimizedErrorBoundary>
        <Suspense fallback={<OptimizedLoadingStates.Table />}>
          <ClaimsListTable />
        </Suspense>
      </OptimizedErrorBoundary>
    </div>
  );
};

export default ClaimsList;
