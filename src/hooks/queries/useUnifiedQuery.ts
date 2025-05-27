
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { ErrorService } from '@/services/errorHandling';
import { DASHBOARD_CONSTANTS } from '@/lib/dashboard-constants';

export interface UnifiedQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
  errorContext?: string;
  useOptimisticUpdates?: boolean;
}

export function useUnifiedQuery<T>(
  queryKey: any[],
  queryFn: () => Promise<T>,
  options: UnifiedQueryOptions<T> = {}
) {
  const {
    errorContext = 'fetch data',
    useOptimisticUpdates = false,
    ...queryOptions
  } = options;

  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        return await queryFn();
      } catch (error) {
        ErrorService.handleSupabaseError(error as any, errorContext);
        throw error;
      }
    },
    staleTime: DASHBOARD_CONSTANTS.CACHE_TIMES.STALE_TIME,
    gcTime: DASHBOARD_CONSTANTS.CACHE_TIMES.GC_TIME,
    retry: (failureCount, error) => {
      return ErrorService.shouldRetryQuery(failureCount, error);
    },
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
    ...queryOptions
  });
}
