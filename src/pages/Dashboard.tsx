
import { DashboardFiltersProvider } from '@/contexts/DashboardFiltersContext';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardKpiSection } from '@/components/dashboard/DashboardKpiSection';
import { DashboardChartsGrid } from '@/components/dashboard/DashboardChartsGrid';
import { MobileOptimizedFilters } from '@/components/dashboard/MobileOptimizedFilters';
import { NotificationToasts } from '@/components/dashboard/NotificationToasts';
import { ImprovedErrorBoundary } from '@/components/shared/ImprovedErrorBoundary';

const DashboardContent = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-responsive py-6 lg:py-8 xl:py-10">
        <div className="card-content-spacing animate-fade-in">
          <NotificationToasts />
          
          <DashboardHeader />

          <DashboardKpiSection />

          <ImprovedErrorBoundary title="Feil ved lasting av filtre">
            <MobileOptimizedFilters />
          </ImprovedErrorBoundary>

          <DashboardChartsGrid />
        </div>
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
