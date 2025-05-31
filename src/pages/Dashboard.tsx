
import React from 'react';
import { DashboardFiltersProvider } from '@/contexts/DashboardFiltersContext';
import { OptimizedErrorBoundary } from '@/components/shared/OptimizedErrorBoundary';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { OptimizedLoadingStates } from '@/components/shared/OptimizedLoadingStates';
import { UnifiedErrorBoundary } from '@/components/shared/UnifiedErrorBoundary';
import { Suspense } from 'react';

const DashboardKpiSection = React.lazy(() => import('@/components/dashboard/DashboardKpiSection').then(module => ({ default: module.DashboardKpiSection })));
const DashboardChartsGrid = React.lazy(() => import('@/components/dashboard/DashboardChartsGrid').then(module => ({ default: module.DashboardChartsGrid })));
const EnhancedDashboardFilters = React.lazy(() => import('@/components/dashboard/EnhancedDashboardFilters'));

const Dashboard = () => {
  return (
    <DashboardFiltersProvider>
      <OptimizedErrorBoundary>
        <div className="p-6 space-y-6 animate-fade-in">
          <DashboardHeader />
          
          <UnifiedErrorBoundary title="Feil ved lasting av nøkkeltall">
            <Suspense fallback={<OptimizedLoadingStates.Dashboard />}>
              <DashboardKpiSection />
            </Suspense>
          </UnifiedErrorBoundary>

          <UnifiedErrorBoundary title="Feil ved lasting av filtre">
            <Suspense fallback={<OptimizedLoadingStates.Form />}>
              <EnhancedDashboardFilters />
            </Suspense>
          </UnifiedErrorBoundary>

          <UnifiedErrorBoundary title="Feil ved lasting av diagrammer">
            <Suspense fallback={<OptimizedLoadingStates.Dashboard />}>
              <DashboardChartsGrid />
            </Suspense>
          </UnifiedErrorBoundary>
        </div>
      </OptimizedErrorBoundary>
    </DashboardFiltersProvider>
  );
};

export default Dashboard;
