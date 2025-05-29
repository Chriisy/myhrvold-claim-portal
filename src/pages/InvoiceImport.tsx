
import React, { Suspense } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { OptimizedErrorBoundary } from '@/components/shared/OptimizedErrorBoundary';
import { OptimizedLoadingStates } from '@/components/shared/OptimizedLoadingStates';

const ImportWizard = React.lazy(() => import('@/components/import/ImportWizard').then(module => ({ default: module.ImportWizard })));

const InvoiceImport = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-3xl font-bold text-myhrvold-primary">Import</h1>
          <p className="text-gray-600">Importer fakturaer og kostnadslinjer</p>
        </div>
      </div>

      <OptimizedErrorBoundary>
        <Suspense fallback={<OptimizedLoadingStates.Form />}>
          <ImportWizard />
        </Suspense>
      </OptimizedErrorBoundary>
    </div>
  );
};

export default InvoiceImport;
