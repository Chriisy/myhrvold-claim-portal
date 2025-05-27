
import { DashboardFiltersProvider } from '@/contexts/DashboardFiltersContext';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardKpiSection } from '@/components/dashboard/DashboardKpiSection';
import { DashboardChartsGrid } from '@/components/dashboard/DashboardChartsGrid';
import { MobileOptimizedFilters } from '@/components/dashboard/MobileOptimizedFilters';
import { NotificationToasts } from '@/components/dashboard/NotificationToasts';
import { ImprovedErrorBoundary } from '@/components/shared/ImprovedErrorBoundary';

const DashboardContent = () => {
  return (
    <div className="space-y-8 lg:space-y-12 animate-fade-in">
      <NotificationToasts />
      
      <DashboardHeader />

      <DashboardKpiSection />

      {/* Mobile Optimized Filters */}
      <ImprovedErrorBoundary title="Feil ved lasting av filtre">
        <MobileOptimizedFilters />
      </ImprovedErrorBoundary>

      <DashboardChartsGrid />
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
