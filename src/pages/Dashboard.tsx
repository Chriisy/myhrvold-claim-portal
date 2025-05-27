
import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardFiltersProvider } from '@/contexts/DashboardFiltersContext';
import { DashboardContainer } from '@/components/dashboard/core/DashboardContainer';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';

const Dashboard: React.FC = () => {
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
        </div>
        
        <DashboardFilters />
        <DashboardContainer />
      </div>
    </DashboardFiltersProvider>
  );
};

export default Dashboard;
