
import React, { Suspense, useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { OptimizedErrorBoundary } from '@/components/shared/OptimizedErrorBoundary';
import { OptimizedLoadingStates } from '@/components/shared/OptimizedLoadingStates';

const ReportDateRangePicker = React.lazy(() => import('@/components/reports/ReportDateRangePicker').then(module => ({ default: module.ReportDateRangePicker })));
const AvailableReports = React.lazy(() => import('@/components/reports/AvailableReports').then(module => ({ default: module.AvailableReports })));
const AIReportGenerator = React.lazy(() => import('@/components/ai/AIReportGenerator').then(module => ({ default: module.AIReportGenerator })));

const Reports = () => {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date()
  });

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
          <ReportDateRangePicker 
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        </Suspense>
      </OptimizedErrorBoundary>

      <OptimizedErrorBoundary>
        <Suspense fallback={<OptimizedLoadingStates.Cards />}>
          <AvailableReports dateRange={dateRange} />
        </Suspense>
      </OptimizedErrorBoundary>

      <OptimizedErrorBoundary>
        <Suspense fallback={<OptimizedLoadingStates.Form />}>
          <AIReportGenerator />
        </Suspense>
      </OptimizedErrorBoundary>
    </div>
  );
};

export default Reports;
