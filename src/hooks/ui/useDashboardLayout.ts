
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
    return 'px-6 lg:px-10 xl:px-12 2xl:px-16';
  };

  const getSpacing = (size: 'sm' | 'md' | 'lg' = 'md') => {
    switch (size) {
      case 'sm':
        return 'gap-6 lg:gap-8';
      case 'md':
        return 'gap-8 lg:gap-10 xl:gap-12';
      case 'lg':
        return 'gap-10 lg:gap-12 xl:gap-16';
      default:
        return 'gap-8 lg:gap-10 xl:gap-12';
    }
  };

  return {
    getGridClasses,
    getChartConfig,
    getContainerPadding,
    getSpacing
  };
};
