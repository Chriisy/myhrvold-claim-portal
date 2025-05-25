
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardFiltersProvider } from '@/contexts/DashboardFiltersContext';
import KpiCardsGrid from '@/components/dashboard/KpiCardsGrid';
import AdditionalKpiCards from '@/components/dashboard/AdditionalKpiCards';
import { QuickStatsCards } from '@/components/dashboard/QuickStatsCards';
import { MobileOptimizedFilters } from '@/components/dashboard/MobileOptimizedFilters';
import OptimizedStackedBarChart from '@/components/dashboard/OptimizedStackedBarChart';
import OptimizedDonutChart from '@/components/dashboard/OptimizedDonutChart';
import SupplierDistributionChart from '@/components/dashboard/SupplierDistributionChart';
import EnhancedRecentClaimsTable from '@/components/dashboard/EnhancedRecentClaimsTable';
import { InteractiveChartWrapper } from '@/components/dashboard/InteractiveChartWrapper';
import { NotificationToasts } from '@/components/dashboard/NotificationToasts';
import ErrorBoundary from '@/components/ui/error-boundary';
import { useIsMobile } from '@/hooks/use-mobile';

const DashboardContent = () => {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-6 animate-fade-in">
      <NotificationToasts />
      
      <div className={`flex items-center justify-between ${isMobile ? 'flex-col gap-4' : ''}`}>
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-myhrvold-primary">Dashboard</h1>
            <p className="text-gray-600">Oversikt over reklamasjoner og nøkkeltall</p>
          </div>
        </div>
        <Link to="/claim/new">
          <Button className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Ny Reklamasjon
          </Button>
        </Link>
      </div>

      {/* Quick Stats Cards */}
      <ErrorBoundary title="Feil ved lasting av hurtigstatistikk">
        <QuickStatsCards />
      </ErrorBoundary>

      {/* Main KPI Cards */}
      <ErrorBoundary title="Feil ved lasting av nøkkeltall">
        <KpiCardsGrid />
      </ErrorBoundary>

      {/* Additional KPI Cards */}
      <ErrorBoundary title="Feil ved lasting av ekstra nøkkeltall">
        <AdditionalKpiCards />
      </ErrorBoundary>

      {/* Mobile Optimized Filters */}
      <ErrorBoundary title="Feil ved lasting av filtre">
        <MobileOptimizedFilters />
      </ErrorBoundary>

      {/* Charts with Interactive Wrappers */}
      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
        <ErrorBoundary title="Feil ved lasting av kostnadsdiagram">
          <InteractiveChartWrapper 
            title="Kostnader per Konto"
            description="Månedlig oversikt over kostnader fordelt på kontoer"
          >
            <OptimizedStackedBarChart />
          </InteractiveChartWrapper>
        </ErrorBoundary>
        
        <ErrorBoundary title="Feil ved lasting av leverandørfordeling">
          <InteractiveChartWrapper 
            title="Leverandørfordeling"
            description="Prosentvis fordeling av kostnader per leverandør"
          >
            <SupplierDistributionChart />
          </InteractiveChartWrapper>
        </ErrorBoundary>
      </div>

      {/* Root Cause Chart and Recent Claims */}
      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
        <ErrorBoundary title="Feil ved lasting av årsaksanalyse">
          <InteractiveChartWrapper 
            title="Årsaksanalyse"
            description="Fordeling av reklamasjoner etter rotårsak"
          >
            <OptimizedDonutChart />
          </InteractiveChartWrapper>
        </ErrorBoundary>
        
        <ErrorBoundary title="Feil ved lasting av siste reklamasjoner">
          <InteractiveChartWrapper 
            title="Siste Reklamasjoner"
            description="Oversikt over nyeste reklamasjoner"
          >
            <EnhancedRecentClaimsTable />
          </InteractiveChartWrapper>
        </ErrorBoundary>
      </div>
    </div>
  );
};

const Dashboard = () => {
  return (
    <DashboardFiltersProvider>
      <DashboardContent />
    </DashboardFiltersProvider>
  );
};

export default Dashboard;
