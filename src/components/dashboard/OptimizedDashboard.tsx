
import React, { Suspense } from 'react';
import { DashboardHeader } from './DashboardHeader';
import { OptimizedLoadingStates } from '@/components/shared/OptimizedLoadingStates';
import { UnifiedErrorBoundary } from '@/components/shared/UnifiedErrorBoundary';

// Lazy load heavy components for better performance
const DashboardKpiSection = React.lazy(() => import('./DashboardKpiSection').then(module => ({ default: module.DashboardKpiSection })));
const DashboardChartsGrid = React.lazy(() => import('./DashboardChartsGrid').then(module => ({ default: module.DashboardChartsGrid })));
const EnhancedDashboardFilters = React.lazy(() => import('./EnhancedDashboardFilters'));

const OptimizedDashboard = () => {
  return (
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
  );
};

export default OptimizedDashboard;
