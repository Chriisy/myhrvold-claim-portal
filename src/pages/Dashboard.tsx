
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardFiltersProvider } from '@/contexts/DashboardFiltersContext';
import KpiCardsGrid from '@/components/dashboard/KpiCardsGrid';
import EnhancedDashboardFilters from '@/components/dashboard/EnhancedDashboardFilters';
import OptimizedStackedBarChart from '@/components/dashboard/OptimizedStackedBarChart';
import OptimizedDonutChart from '@/components/dashboard/OptimizedDonutChart';
import SupplierDistributionChart from '@/components/dashboard/SupplierDistributionChart';
import EnhancedRecentClaimsTable from '@/components/dashboard/EnhancedRecentClaimsTable';
import ErrorBoundary from '@/components/ui/error-boundary';

const DashboardContent = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
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

      {/* KPI Cards with Error Boundary */}
      <ErrorBoundary title="Feil ved lasting av nøkkeltall">
        <KpiCardsGrid />
      </ErrorBoundary>

      {/* Enhanced Filters */}
      <ErrorBoundary title="Feil ved lasting av filtre">
        <EnhancedDashboardFilters />
      </ErrorBoundary>

      {/* Charts with Error Boundaries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ErrorBoundary title="Feil ved lasting av kostnadsdiagram">
          <OptimizedStackedBarChart />
        </ErrorBoundary>
        <ErrorBoundary title="Feil ved lasting av leverandørfordeling">
          <SupplierDistributionChart />
        </ErrorBoundary>
      </div>

      {/* Root Cause Chart and Recent Claims with Error Boundaries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ErrorBoundary title="Feil ved lasting av årsaksanalyse">
          <OptimizedDonutChart />
        </ErrorBoundary>
        <ErrorBoundary title="Feil ved lasting av siste reklamasjoner">
          <EnhancedRecentClaimsTable />
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
