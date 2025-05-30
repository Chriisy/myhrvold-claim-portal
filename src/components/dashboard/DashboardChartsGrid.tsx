
import React, { Suspense } from 'react';
import { UnifiedErrorBoundary } from '@/components/shared/UnifiedErrorBoundary';
import { OptimizedLoadingStates } from '@/components/shared/OptimizedLoadingStates';
import { useIsMobile } from '@/hooks/use-mobile';
import { CHART_DEFINITIONS } from '@/config/dashboardConfig';

// Lazy load chart components for better performance
const InteractiveChartWrapper = React.lazy(() => import('@/components/dashboard/InteractiveChartWrapper').then(module => ({ default: module.InteractiveChartWrapper })));
const OptimizedStackedBarChart = React.lazy(() => import('@/components/dashboard/OptimizedStackedBarChart'));
const OptimizedDonutChart = React.lazy(() => import('@/components/dashboard/OptimizedDonutChart'));
const SupplierDistributionChart = React.lazy(() => import('@/components/dashboard/SupplierDistributionChart'));
const EnhancedRecentClaimsTable = React.lazy(() => import('@/components/dashboard/EnhancedRecentClaimsTable').then(module => ({ default: module.EnhancedRecentClaimsTable })));

export const DashboardChartsGrid = () => {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-6">
      {/* Main Charts Row */}
      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
        <UnifiedErrorBoundary title="Feil ved lasting av kostnadsdiagram">
          <Suspense fallback={<OptimizedLoadingStates.Cards />}>
            <InteractiveChartWrapper 
              title={CHART_DEFINITIONS.stackedBar.title}
              description={CHART_DEFINITIONS.stackedBar.description}
            >
              <OptimizedStackedBarChart />
            </InteractiveChartWrapper>
          </Suspense>
        </UnifiedErrorBoundary>
        
        <UnifiedErrorBoundary title="Feil ved lasting av leverandørfordeling">
          <Suspense fallback={<OptimizedLoadingStates.Cards />}>
            <InteractiveChartWrapper 
              title={CHART_DEFINITIONS.supplierDistribution.title}
              description={CHART_DEFINITIONS.supplierDistribution.description}
            >
              <SupplierDistributionChart />
            </InteractiveChartWrapper>
          </Suspense>
        </UnifiedErrorBoundary>
      </div>

      {/* Secondary Charts Row */}
      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
        <UnifiedErrorBoundary title="Feil ved lasting av årsaksanalyse">
          <Suspense fallback={<OptimizedLoadingStates.Cards />}>
            <InteractiveChartWrapper 
              title={CHART_DEFINITIONS.rootCause.title}
              description={CHART_DEFINITIONS.rootCause.description}
            >
              <OptimizedDonutChart />
            </InteractiveChartWrapper>
          </Suspense>
        </UnifiedErrorBoundary>
        
        <UnifiedErrorBoundary title="Feil ved lasting av siste reklamasjoner">
          <Suspense fallback={<OptimizedLoadingStates.Table />}>
            <InteractiveChartWrapper 
              title={CHART_DEFINITIONS.recentClaims.title}
              description={CHART_DEFINITIONS.recentClaims.description}
            >
              <EnhancedRecentClaimsTable />
            </InteractiveChartWrapper>
          </Suspense>
        </UnifiedErrorBoundary>
      </div>
    </div>
  );
};
