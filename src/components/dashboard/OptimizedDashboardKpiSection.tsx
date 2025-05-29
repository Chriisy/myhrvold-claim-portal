
import React from 'react';
import { LazyLoadedComponent } from '@/components/shared/LazyLoadedComponent';
import { OptimizedLoadingStates } from '@/components/shared/OptimizedLoadingStates';
import { UnifiedErrorBoundary } from '@/components/shared/UnifiedErrorBoundary';

// Lazy load heavy components
const KpiCardsGrid = React.lazy(() => import('./KpiCardsGrid'));
const AdditionalKpiCards = React.lazy(() => import('./AdditionalKpiCards'));
const QuickStatsCards = React.lazy(() => import('./QuickStatsCards').then(module => ({ default: module.QuickStatsCards })));

export const OptimizedDashboardKpiSection = () => {
  return (
    <div className="space-y-6">
      {/* Quick Stats Cards */}
      <UnifiedErrorBoundary title="Feil ved lasting av hurtigstatistikk">
        <LazyLoadedComponent fallback={<OptimizedLoadingStates.Cards />}>
          <QuickStatsCards />
        </LazyLoadedComponent>
      </UnifiedErrorBoundary>

      {/* Main KPI Cards */}
      <UnifiedErrorBoundary title="Feil ved lasting av nøkkeltall">
        <LazyLoadedComponent fallback={<OptimizedLoadingStates.Cards />}>
          <KpiCardsGrid />
        </LazyLoadedComponent>
      </UnifiedErrorBoundary>

      {/* Additional KPI Cards */}
      <UnifiedErrorBoundary title="Feil ved lasting av ekstra nøkkeltall">
        <LazyLoadedComponent fallback={<OptimizedLoadingStates.Cards />}>
          <AdditionalKpiCards />
        </LazyLoadedComponent>
      </UnifiedErrorBoundary>
    </div>
  );
};
