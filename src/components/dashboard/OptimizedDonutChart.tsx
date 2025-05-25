
import { PieChart as PieChartIcon } from 'lucide-react';
import { useDashboardFilters } from '@/contexts/DashboardFiltersContext';
import { useRootCauseData } from '@/hooks/api/dashboard/useRootCauseData';
import { memo } from 'react';
import DonutChart from './charts/DonutChart';
import DashboardSection from './DashboardSection';

const OptimizedDonutChart = memo(() => {
  const { filters } = useDashboardFilters();
  const { data, isLoading, isError, error, refetch } = useRootCauseData(filters);

  return (
    <DashboardSection
      title="Rotårsak Fordeling (Siste 6 måneder)"
      description="Fordeling av rotårsaker for reklamasjoner"
      icon={PieChartIcon}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={() => refetch()}
    >
      <DonutChart 
        data={data || []}
        title="Rotårsak Fordeling (Siste 6 måneder)"
        description="Fordeling av rotårsaker for reklamasjoner"
      />
    </DashboardSection>
  );
});

OptimizedDonutChart.displayName = 'OptimizedDonutChart';

export default OptimizedDonutChart;
