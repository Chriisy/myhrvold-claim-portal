
import { ImprovedErrorBoundary } from '@/components/shared/ImprovedErrorBoundary';
import KpiCardsGrid from '@/components/dashboard/KpiCardsGrid';
import AdditionalKpiCards from '@/components/dashboard/AdditionalKpiCards';
import { QuickStatsCards } from '@/components/dashboard/QuickStatsCards';

export const DashboardKpiSection = () => {
  return (
    <div className="space-y-6">
      {/* Quick Stats Cards */}
      <ImprovedErrorBoundary title="Feil ved lasting av hurtigstatistikk">
        <QuickStatsCards />
      </ImprovedErrorBoundary>

      {/* Main KPI Cards */}
      <ImprovedErrorBoundary title="Feil ved lasting av nøkkeltall">
        <KpiCardsGrid />
      </ImprovedErrorBoundary>

      {/* Additional KPI Cards */}
      <ImprovedErrorBoundary title="Feil ved lasting av ekstra nøkkeltall">
        <AdditionalKpiCards />
      </ImprovedErrorBoundary>
    </div>
  );
};
