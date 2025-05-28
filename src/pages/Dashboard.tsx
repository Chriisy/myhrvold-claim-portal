
import React from 'react';
import { DashboardFiltersProvider } from '@/contexts/DashboardFiltersContext';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { OptimizedDashboardKpiSection } from '@/components/dashboard/OptimizedDashboardKpiSection';
import { LazyLoadedComponent } from '@/components/shared/LazyLoadedComponent';
import { OptimizedLoadingStates } from '@/components/shared/OptimizedLoadingStates';
import { UnifiedErrorBoundary } from '@/components/shared/UnifiedErrorBoundary';
import { useQueryOptimization } from '@/hooks/performance/useQueryOptimization';

// Lazy load heavy components
const DashboardChartsGrid = React.lazy(() => import('@/components/dashboard/DashboardChartsGrid').then(module => ({ default: module.DashboardChartsGrid })));
const MobileOptimizedFilters = React.lazy(() => import('@/components/dashboard/MobileOptimizedFilters').then(module => ({ default: module.MobileOptimizedFilters })));
const NotificationToasts = React.lazy(() => import('@/components/dashboard/NotificationToasts').then(module => ({ default: module.NotificationToasts })));

const Dashboard = () => {
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
      <UnifiedErrorBoundary title="Feil ved lasting av filtre">
        <LazyLoadedComponent fallback={<OptimizedLoadingStates />}>
          <MobileOptimizedFilters />
        </LazyLoadedComponent>
      </UnifiedErrorBoundary>

      <LazyLoadedComponent fallback={<OptimizedLoadingStates />}>
        <DashboardChartsGrid />
      </LazyLoadedComponent>
    </div>
  );
};

export default Dashboard;
