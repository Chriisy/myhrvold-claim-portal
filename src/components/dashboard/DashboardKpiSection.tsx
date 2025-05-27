
import { UnifiedErrorBoundary } from '@/components/shared/UnifiedErrorBoundary';
import KpiCardsGrid from '@/components/dashboard/KpiCardsGrid';
import AdditionalKpiCards from '@/components/dashboard/AdditionalKpiCards';
import { QuickStatsCards } from '@/components/dashboard/QuickStatsCards';

export const DashboardKpiSection = () => {
  return (
    <div className="space-y-6">
      {/* Quick Stats Cards */}
      <UnifiedErrorBoundary title="Feil ved lasting av hurtigstatistikk">
        <QuickStatsCards />
      </UnifiedErrorBoundary>

      {/* Main KPI Cards */}
      <UnifiedErrorBoundary title="Feil ved lasting av nøkkeltall">
        <KpiCardsGrid />
      </UnifiedErrorBoundary>

      {/* Additional KPI Cards */}
      <UnifiedErrorBoundary title="Feil ved lasting av ekstra nøkkeltall">
        <AdditionalKpiCards />
      </UnifiedErrorBoundary>
    </div>
  );
};
