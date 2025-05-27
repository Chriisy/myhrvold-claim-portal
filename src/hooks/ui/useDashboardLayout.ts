
import { CHART_DEFINITIONS } from '@/config/dashboardConfig';

export const useDashboardLayout = () => {
  const getGridClasses = (columns: number = 2) => {
    switch (columns) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 xl:grid-cols-2';
      case 3:
        return 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3';
      case 4:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      case 6:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6';
      default:
        return 'grid-cols-1 xl:grid-cols-2';
    }
  };

  const getChartConfig = (chartKey: keyof typeof CHART_DEFINITIONS) => {
    return CHART_DEFINITIONS[chartKey];
  };

  const getContainerPadding = () => {
    return 'px-4 lg:px-6 xl:px-8';
  };

  const getSpacing = (size: 'sm' | 'md' | 'lg' = 'md') => {
    switch (size) {
      case 'sm':
        return 'gap-4 lg:gap-6';
      case 'md':
        return 'gap-6 lg:gap-8';
      case 'lg':
        return 'gap-8 lg:gap-12';
      default:
        return 'gap-6 lg:gap-8';
    }
  };

  return {
    getGridClasses,
    getChartConfig,
    getContainerPadding,
    getSpacing
  };
};
