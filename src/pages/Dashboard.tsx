
import React from 'react';
import { DashboardFiltersProvider } from '@/contexts/DashboardFiltersContext';
import { OptimizedErrorBoundary } from '@/components/shared/OptimizedErrorBoundary';
import OptimizedDashboard from '@/components/dashboard/OptimizedDashboard';

const Dashboard = () => {
  return (
    <DashboardFiltersProvider>
      <OptimizedErrorBoundary>
        <OptimizedDashboard />
      </OptimizedErrorBoundary>
    </DashboardFiltersProvider>
  );
};

export default Dashboard;
