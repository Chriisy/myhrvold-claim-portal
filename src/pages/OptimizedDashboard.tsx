
import React from 'react';
import { DashboardFiltersProvider } from '@/contexts/DashboardFiltersContext';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { OptimizedDashboardKpiSection } from '@/components/dashboard/OptimizedDashboardKpiSection';
import { LazyLoadedComponent } from '@/components/shared/LazyLoadedComponent';
import { OptimizedLoadingStates } from '@/components/shared/OptimizedLoadingStates';
import { ImprovedErrorBoundary } from '@/components/shared/ImprovedErrorBoundary';
import { useQueryOptimization } from '@/hooks/performance/useQueryOptimization';

// Lazy load heavy components
const DashboardChartsGrid = React.lazy(() => import('@/components/dashboard/DashboardChartsGrid').then(module => ({ default: module.DashboardChartsGrid })));
const MobileOptimizedFilters = React.lazy(() => import('@/components/dashboard/MobileOptimizedFilters').then(module => ({ default: module.MobileOptimizedFilters })));
const NotificationToasts = React.lazy(() => import('@/components/dashboard/NotificationToasts').then(module => ({ default: module.NotificationToasts })));

const DashboardContent = () => {
  // Initialize query optimizations
  useQueryOptimization();

  return (
    <div className="space-y-6 animate-fade-in">
      <LazyLoadedComponent fallback={<div />}>
        <NotificationToasts />
      </LazyLoadedComponent>
      
      <DashboardHeader />

      <OptimizedDashboardKpiSection />

      {/* Mobile Optimized Filters */}
      <ImprovedErrorBoundary title="Feil ved lasting av filtre">
        <LazyLoadedComponent fallback={<OptimizedLoadingStates />}>
          <MobileOptimizedFilters />
        </LazyLoadedComponent>
      </ImprovedErrorBoundary>

      <LazyLoadedComponent fallback={<OptimizedLoadingStates />}>
        <DashboardChartsGrid />
      </LazyLoadedComponent>
    </div>
  );
};

const OptimizedDashboard = () => {
  return (
    <DashboardFiltersProvider>
      <DashboardContent />
    </DashboardFiltersProvider>
  );
};

export default OptimizedDashboard;
