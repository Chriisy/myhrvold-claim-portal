
import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
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
        <Suspense fallback={<OptimizedLoadingStates />}>
          <DashboardKpiSection />
        </Suspense>
      </UnifiedErrorBoundary>

      <UnifiedErrorBoundary title="Feil ved lasting av filtre">
        <Suspense fallback={<OptimizedLoadingStates />}>
          <EnhancedDashboardFilters />
        </Suspense>
      </UnifiedErrorBoundary>

      <UnifiedErrorBoundary title="Feil ved lasting av diagrammer">
        <Suspense fallback={<OptimizedLoadingStates />}>
          <DashboardChartsGrid />
        </Suspense>
      </UnifiedErrorBoundary>
    </div>
  );
};

export default OptimizedDashboard;
