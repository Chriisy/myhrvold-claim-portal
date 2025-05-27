
import { ImprovedErrorBoundary } from '@/components/shared/ImprovedErrorBoundary';
import { InteractiveChartWrapper } from '@/components/dashboard/InteractiveChartWrapper';
import OptimizedStackedBarChart from '@/components/dashboard/OptimizedStackedBarChart';
import OptimizedDonutChart from '@/components/dashboard/OptimizedDonutChart';
import SupplierDistributionChart from '@/components/dashboard/SupplierDistributionChart';
import { EnhancedRecentClaimsTable } from '@/components/dashboard/EnhancedRecentClaimsTable';
import { useIsMobile } from '@/hooks/use-mobile';
import { CHART_DEFINITIONS } from '@/config/dashboardConfig';

export const DashboardChartsGrid = () => {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-6">
      {/* Main Charts Row */}
      <div className={`responsive-grid-2 responsive-gap`}>
        <ImprovedErrorBoundary title="Feil ved lasting av kostnadsdiagram">
          <InteractiveChartWrapper 
            title={CHART_DEFINITIONS.stackedBar.title}
            description={CHART_DEFINITIONS.stackedBar.description}
          >
            <OptimizedStackedBarChart />
          </InteractiveChartWrapper>
        </ImprovedErrorBoundary>
        
        <ImprovedErrorBoundary title="Feil ved lasting av leverandørfordeling">
          <InteractiveChartWrapper 
            title={CHART_DEFINITIONS.supplierDistribution.title}
            description={CHART_DEFINITIONS.supplierDistribution.description}
          >
            <SupplierDistributionChart />
          </InteractiveChartWrapper>
        </ImprovedErrorBoundary>
      </div>

      {/* Secondary Charts Row */}
      <div className={`responsive-grid-2 responsive-gap`}>
        <ImprovedErrorBoundary title="Feil ved lasting av årsaksanalyse">
          <InteractiveChartWrapper 
            title={CHART_DEFINITIONS.rootCause.title}
            description={CHART_DEFINITIONS.rootCause.description}
          >
            <OptimizedDonutChart />
          </InteractiveChartWrapper>
        </ImprovedErrorBoundary>
        
        <ImprovedErrorBoundary title="Feil ved lasting av siste reklamasjoner">
          <InteractiveChartWrapper 
            title={CHART_DEFINITIONS.recentClaims.title}
            description={CHART_DEFINITIONS.recentClaims.description}
          >
            <EnhancedRecentClaimsTable />
          </InteractiveChartWrapper>
        </ImprovedErrorBoundary>
      </div>
    </div>
  );
};
