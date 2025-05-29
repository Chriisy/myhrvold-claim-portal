
import React, { Suspense } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { OptimizedErrorBoundary } from '@/components/shared/OptimizedErrorBoundary';
import { OptimizedLoadingStates } from '@/components/shared/OptimizedLoadingStates';

const ReportDateRangePicker = React.lazy(() => import('@/components/reports/ReportDateRangePicker').then(module => ({ default: module.ReportDateRangePicker })));

const Reports = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-3xl font-bold text-myhrvold-primary">Rapporter</h1>
          <p className="text-gray-600">Generer og eksporter rapporter</p>
        </div>
      </div>

      <OptimizedErrorBoundary>
        <Suspense fallback={<OptimizedLoadingStates.Form />}>
          <ReportDateRangePicker />
        </Suspense>
      </OptimizedErrorBoundary>
    </div>
  );
};

export default Reports;
