
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SystemHealthService, SystemMetrics } from '@/services/systemHealth/systemHealthService';
import { ErrorService } from '@/services/errorHandling/errorService';
import { queryKeys } from '@/lib/queryKeys';

export const useSystemHealth = () => {
  return useQuery({
    queryKey: queryKeys.systemHealth.metrics(),
    queryFn: async () => {
      return ErrorService.withRetry(() => SystemHealthService.collectMetrics());
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
    retry: ErrorService.shouldRetryQuery
  });
};
