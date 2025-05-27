
import { useIsMobile } from '@/hooks/use-mobile';
import { CHART_DEFINITIONS } from '@/config/dashboardConfig';

export const useDashboardLayout = () => {
  const isMobile = useIsMobile();

  const getGridClasses = (columns: number = 2) => {
    return isMobile ? 'grid-cols-1' : `grid-cols-1 lg:grid-cols-${columns}`;
  };

  const getChartConfig = (chartKey: keyof typeof CHART_DEFINITIONS) => {
    return CHART_DEFINITIONS[chartKey];
  };

  return {
    isMobile,
    getGridClasses,
    getChartConfig
  };
};
