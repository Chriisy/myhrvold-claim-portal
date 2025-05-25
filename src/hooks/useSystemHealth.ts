
import { useState, useEffect } from 'react';
import { SystemHealthService, SystemMetrics } from '@/services/systemHealth/systemHealthService';
import { ErrorService } from '@/services/errorHandling/errorService';

export const useSystemHealth = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const collectMetrics = async () => {
    try {
      setIsLoading(true);
      const metrics = await ErrorService.withRetry(() => SystemHealthService.collectMetrics());
      setMetrics(metrics);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('System health check failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    collectMetrics();
    
    // Refresh metrics every 30 seconds
    const interval = setInterval(collectMetrics, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    metrics,
    isLoading,
    error,
    refresh: collectMetrics
  };
};
