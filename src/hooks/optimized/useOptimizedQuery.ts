
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { DashboardCache } from '@/services/cache/dashboardCache';
import { DASHBOARD_CONSTANTS } from '@/lib/dashboard-constants';

export interface OptimizedQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
  cacheKey?: string;
  useCache?: boolean;
  onCacheHit?: (data: T) => void;
  onCacheMiss?: () => void;
}

export function useOptimizedQuery<T>(
  queryKey: any[],
  queryFn: () => Promise<T>,
  options: OptimizedQueryOptions<T> = {}
) {
  const {
    cacheKey,
    useCache = true,
    onCacheHit,
    onCacheMiss,
    ...queryOptions
  } = options;

  return useQuery({
    queryKey,
    queryFn: async () => {
      // Check cache first if enabled
      if (useCache && cacheKey) {
        const cachedData = DashboardCache.getChartData(cacheKey, {} as any);
        if (cachedData) {
          onCacheHit?.(cachedData);
          return cachedData;
        }
        onCacheMiss?.();
      }

      // Execute query
      const data = await queryFn();

      // Cache the result if enabled
      if (useCache && cacheKey) {
        DashboardCache.setChartData(cacheKey, {} as any, data);
      }

      return data;
    },
    staleTime: DASHBOARD_CONSTANTS.CACHE_TIMES.STALE_TIME,
    gcTime: DASHBOARD_CONSTANTS.CACHE_TIMES.GC_TIME,
    retry: (failureCount, error) => {
      // Don't retry on client errors
      if (error && typeof error === 'object' && 'status' in error) {
        return (error as any).status >= 500 && failureCount < 2;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
    ...queryOptions
  });
}
