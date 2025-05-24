
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardFiltersProvider } from '@/contexts/DashboardFiltersContext';
import KPICards from '@/components/dashboard/KPICards';
import DashboardFilters from '@/components/dashboard/DashboardFilters';
import CostByAccountChart from '@/components/dashboard/CostByAccountChart';
import SupplierDistributionChart from '@/components/dashboard/SupplierDistributionChart';
import RecentClaimsTable from '@/components/dashboard/RecentClaimsTable';

const Dashboard = () => {
  return (
    <DashboardFiltersProvider>
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
        <KPICards />

        {/* Filters */}
        <DashboardFilters />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CostByAccountChart />
          <SupplierDistributionChart />
        </div>

        {/* Recent Claims */}
        <RecentClaimsTable />
      </div>
    </DashboardFiltersProvider>
  );
};

export default Dashboard;
