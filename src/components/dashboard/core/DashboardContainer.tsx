
import React from 'react';
import { UnifiedErrorBoundary } from '@/components/shared/UnifiedErrorBoundary';
import { DashboardKpiSection } from '../DashboardKpiSection';
import { DashboardChartsGrid } from '../DashboardChartsGrid';

export const DashboardContainer: React.FC = () => {
  return (
    <div className="space-y-6">
      <UnifiedErrorBoundary title="Feil ved lasting av dashboard">
        <div className="grid gap-6">
          <DashboardKpiSection />
          <DashboardChartsGrid />
        </div>
      </UnifiedErrorBoundary>
    </div>
  );
};
