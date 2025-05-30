
import React, { Suspense } from 'react';
import { UnifiedErrorBoundary } from '@/components/shared/UnifiedErrorBoundary';
import { OptimizedLoadingStates } from '@/components/shared/OptimizedLoadingStates';

// Lazy load components for better performance
const KpiCardsGrid = React.lazy(() => import('@/components/dashboard/KpiCardsGrid'));
const AdditionalKpiCards = React.lazy(() => import('@/components/dashboard/AdditionalKpiCards'));
const QuickStatsCards = React.lazy(() => import('@/components/dashboard/QuickStatsCards').then(module => ({ default: module.QuickStatsCards })));

export const DashboardKpiSection = () => {
  return (
    <div className="space-y-6">
      {/* Quick Stats Cards */}
      <UnifiedErrorBoundary title="Feil ved lasting av hurtigstatistikk">
        <Suspense fallback={<OptimizedLoadingStates.Cards />}>
          <QuickStatsCards />
        </Suspense>
      </UnifiedErrorBoundary>

      {/* Main KPI Cards */}
      <UnifiedErrorBoundary title="Feil ved lasting av nøkkeltall">
        <Suspense fallback={<OptimizedLoadingStates.Cards />}>
          <KpiCardsGrid />
        </Suspense>
      </UnifiedErrorBoundary>

      {/* Additional KPI Cards */}
      <UnifiedErrorBoundary title="Feil ved lasting av ekstra nøkkeltall">
        <Suspense fallback={<OptimizedLoadingStates.Cards />}>
          <AdditionalKpiCards />
        </Suspense>
      </UnifiedErrorBoundary>
    </div>
  );
};
