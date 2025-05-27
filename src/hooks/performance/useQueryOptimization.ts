
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';

export const useQueryOptimization = () => {
  const queryClient = useQueryClient();

  // Prefetch critical data
  const prefetchCriticalData = useCallback(() => {
    // Prefetch suppliers
    queryClient.prefetchQuery({
      queryKey: ['suppliers'],
      staleTime: 30 * 60 * 1000, // 30 minutes
    });

    // Prefetch account codes
    queryClient.prefetchQuery({
      queryKey: ['accounts.codes'],
      staleTime: 30 * 60 * 1000, // 30 minutes
    });

    // Prefetch users/technicians
    queryClient.prefetchQuery({
      queryKey: ['users'],
      staleTime: 15 * 60 * 1000, // 15 minutes
    });
  }, [queryClient]);

  // Optimize queries on mount
  useEffect(() => {
    prefetchCriticalData();
  }, [prefetchCriticalData]);

  // Clean up old cache entries
  const cleanupCache = useCallback(() => {
    queryClient.getQueryCache().clear();
  }, [queryClient]);

  // Invalidate related queries efficiently
  const invalidateRelated = useCallback((queryKeys: string[][]) => {
    queryKeys.forEach(key => {
      queryClient.invalidateQueries({ queryKey: key });
    });
  }, [queryClient]);

  return {
    prefetchCriticalData,
    cleanupCache,
    invalidateRelated
  };
};
