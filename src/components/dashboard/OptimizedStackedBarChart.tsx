
import { BarChart as BarChartIcon } from 'lucide-react';
import { useDashboardFilters } from '@/contexts/DashboardFiltersContext';
import { useStackedBarData } from '@/hooks/api/dashboard/useStackedBarData';
import { useNavigate } from 'react-router-dom';
import { memo } from 'react';
import StackedBarChart from './charts/StackedBarChart';
import DashboardSection from './DashboardSection';

const OptimizedStackedBarChart = memo(() => {
  const { filters } = useDashboardFilters();
  const { data, isLoading, isError, error, refetch } = useStackedBarData(filters);
  const navigate = useNavigate();

  const handleBarClick = (clickData: any, month: string) => {
    if (!data?.accountKeys) return;
    
    // Find the highest value account for this month
    const maxAccount = data.accountKeys.reduce((max, key) => 
      (clickData[key] || 0) > (clickData[max] || 0) ? key : max
    );
    navigate(`/claims?konto=${maxAccount}&month=${month}`);
  };

  return (
    <DashboardSection
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={() => refetch()}
    >
      <StackedBarChart 
        data={data?.data || []}
        accountKeys={data?.accountKeys || []}
        accountColors={data?.accountColors || {}}
        onBarClick={handleBarClick}
      />
    </DashboardSection>
  );
});

OptimizedStackedBarChart.displayName = 'OptimizedStackedBarChart';

export default OptimizedStackedBarChart;
