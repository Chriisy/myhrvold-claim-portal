
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardFiltersProvider } from '@/contexts/DashboardFiltersContext';
import EnhancedKPICards from '@/components/dashboard/EnhancedKPICards';
import EnhancedDashboardFilters from '@/components/dashboard/EnhancedDashboardFilters';
import StackedBarChart from '@/components/dashboard/StackedBarChart';
import DonutChart from '@/components/dashboard/DonutChart';
import SupplierDistributionChart from '@/components/dashboard/SupplierDistributionChart';
import EnhancedRecentClaimsTable from '@/components/dashboard/EnhancedRecentClaimsTable';
import { useStackedBarData, useRootCauseDistribution } from '@/hooks/useEnhancedDashboardData';
import { useDashboardFilters } from '@/contexts/DashboardFiltersContext';

const DashboardContent = () => {
  const { filters } = useDashboardFilters();
  const { data: stackedBarData, isLoading: stackedBarLoading } = useStackedBarData(filters);
  const { data: rootCauseData, isLoading: rootCauseLoading } = useRootCauseDistribution(filters);

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

      {/* Enhanced KPI Cards */}
      <EnhancedKPICards />

      {/* Enhanced Filters */}
      <EnhancedDashboardFilters />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StackedBarChart 
          data={stackedBarData?.data || []}
          isLoading={stackedBarLoading}
          accountKeys={stackedBarData?.accountKeys || []}
          accountColors={stackedBarData?.accountColors || {}}
        />
        <SupplierDistributionChart />
      </div>

      {/* Root Cause Chart and Recent Claims */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DonutChart
          data={rootCauseData || []}
          isLoading={rootCauseLoading}
          title="Rotårsak Fordeling (Siste 6 måneder)"
          description="Fordeling av rotårsaker for reklamasjoner"
        />
        <EnhancedRecentClaimsTable />
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
