
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
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="space-y-6 lg:space-y-8 xl:space-y-10 animate-fade-in">
          <NotificationToasts />
          
          <DashboardHeader />

          <DashboardKpiSection />

          {/* Mobile Optimized Filters */}
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
