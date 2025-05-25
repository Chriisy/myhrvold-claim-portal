
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardFiltersProvider } from '@/contexts/DashboardFiltersContext';
import KpiCards from '@/components/dashboard/KpiCards';
import EnhancedDashboardFilters from '@/components/dashboard/EnhancedDashboardFilters';
import OptimizedStackedBarChart from '@/components/dashboard/OptimizedStackedBarChart';
import OptimizedDonutChart from '@/components/dashboard/OptimizedDonutChart';
import SupplierDistributionChart from '@/components/dashboard/SupplierDistributionChart';
import EnhancedRecentClaimsTable from '@/components/dashboard/EnhancedRecentClaimsTable';

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

      {/* KPI Cards */}
      <KpiCards />

      {/* Enhanced Filters */}
      <EnhancedDashboardFilters />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OptimizedStackedBarChart />
        <SupplierDistributionChart />
      </div>

      {/* Root Cause Chart and Recent Claims */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OptimizedDonutChart />
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
