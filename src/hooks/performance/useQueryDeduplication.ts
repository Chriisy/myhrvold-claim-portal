
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';

interface PendingQuery {
  promise: Promise<any>;
  timestamp: number;
}

export const useQueryDeduplication = () => {
  const queryClient = useQueryClient();
  const pendingQueries = useRef<Map<string, PendingQuery>>(new Map());

  const dedupedFetch = useCallback(async <T>(
    queryKey: string,
    fetchFn: () => Promise<T>,
    maxAge: number = 5000 // 5 seconds
  ): Promise<T> => {
    const now = Date.now();
    const existing = pendingQueries.current.get(queryKey);

    // Return existing promise if still fresh
    if (existing && (now - existing.timestamp) < maxAge) {
      return existing.promise;
    }

    // Clean up old entries
    for (const [key, query] of pendingQueries.current.entries()) {
      if ((now - query.timestamp) > maxAge) {
        pendingQueries.current.delete(key);
      }
    }

    // Create new promise
    const promise = fetchFn().finally(() => {
      pendingQueries.current.delete(queryKey);
    });

    pendingQueries.current.set(queryKey, {
      promise,
      timestamp: now
    });

    return promise;
  }, []);

  const prefetchQuery = useCallback(async (
    queryKey: any[],
    fetchFn: () => Promise<any>,
    staleTime?: number
  ) => {
    const keyString = JSON.stringify(queryKey);
    
    return dedupedFetch(keyString, async () => {
      return queryClient.prefetchQuery({
        queryKey,
        queryFn: fetchFn,
        staleTime: staleTime || 5 * 60 * 1000, // 5 minutes default
      });
    });
  }, [queryClient, dedupedFetch]);

  return {
    dedupedFetch,
    prefetchQuery
  };
};
