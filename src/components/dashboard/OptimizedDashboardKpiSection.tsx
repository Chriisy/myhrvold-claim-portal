
import React from 'react';
import { LazyLoadedComponent } from '@/components/shared/LazyLoadedComponent';
import { OptimizedLoadingStates } from '@/components/shared/OptimizedLoadingStates';
import { ImprovedErrorBoundary } from '@/components/shared/ImprovedErrorBoundary';

// Lazy load heavy components
const KpiCardsGrid = React.lazy(() => import('./KpiCardsGrid'));
const AdditionalKpiCards = React.lazy(() => import('./AdditionalKpiCards'));
const QuickStatsCards = React.lazy(() => import('./QuickStatsCards').then(module => ({ default: module.QuickStatsCards })));

export const OptimizedDashboardKpiSection = () => {
  return (
    <div className="space-y-6">
      {/* Quick Stats Cards */}
      <ImprovedErrorBoundary title="Feil ved lasting av hurtigstatistikk">
        <LazyLoadedComponent fallback={<OptimizedLoadingStates />}>
          <QuickStatsCards />
        </LazyLoadedComponent>
      </ImprovedErrorBoundary>

      {/* Main KPI Cards */}
      <ImprovedErrorBoundary title="Feil ved lasting av nøkkeltall">
        <LazyLoadedComponent fallback={<OptimizedLoadingStates />}>
          <KpiCardsGrid />
        </LazyLoadedComponent>
      </ImprovedErrorBoundary>

      {/* Additional KPI Cards */}
      <ImprovedErrorBoundary title="Feil ved lasting av ekstra nøkkeltall">
        <LazyLoadedComponent fallback={<OptimizedLoadingStates />}>
          <AdditionalKpiCards />
        </LazyLoadedComponent>
      </ImprovedErrorBoundary>
    </div>
  );
};
