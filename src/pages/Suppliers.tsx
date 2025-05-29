
import React, { Suspense } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { OptimizedErrorBoundary } from '@/components/shared/OptimizedErrorBoundary';
import { OptimizedLoadingStates } from '@/components/shared/OptimizedLoadingStates';

const SuppliersTable = React.lazy(() => import('@/components/SuppliersTable'));

const Suppliers = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-3xl font-bold text-myhrvold-primary">Leverandører</h1>
          <p className="text-gray-600">Administrer leverandører og kontaktinformasjon</p>
        </div>
      </div>

      <OptimizedErrorBoundary>
        <Suspense fallback={<OptimizedLoadingStates.Table />}>
          <SuppliersTable />
        </Suspense>
      </OptimizedErrorBoundary>
    </div>
  );
};

export default Suppliers;
