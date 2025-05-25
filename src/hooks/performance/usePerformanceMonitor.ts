
import { useEffect, useState, useRef } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  componentMounts: number;
  rerenderCount: number;
  memoryUsage: number;
}

export const usePerformanceMonitor = (componentName: string) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    componentMounts: 0,
    rerenderCount: 0,
    memoryUsage: 0
  });
  
  const renderStartTime = useRef<number>(0);
  const mountCount = useRef<number>(0);
  const rerenderCount = useRef<number>(0);

  // Track component mounts
  useEffect(() => {
    mountCount.current += 1;
    console.log(`${componentName} mounted (${mountCount.current} times)`);
    
    return () => {
      console.log(`${componentName} unmounted`);
    };
  }, [componentName]);

  // Track renders
  useEffect(() => {
    rerenderCount.current += 1;
    const endTime = performance.now();
    const renderTime = endTime - renderStartTime.current;
    
    const memoryUsage = getMemoryUsage();
    
    setMetrics({
      renderTime,
      componentMounts: mountCount.current,
      rerenderCount: rerenderCount.current,
      memoryUsage
    });

    if (renderTime > 16) { // More than one frame (60fps)
      console.warn(`${componentName} slow render: ${renderTime.toFixed(2)}ms`);
    }
  });

  // Start timing before render
  renderStartTime.current = performance.now();

  return metrics;
};

function getMemoryUsage(): number {
  try {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024;
    }
    return 0;
  } catch {
    return 0;
  }
}

// Hook for monitoring specific operations
export const useOperationTimer = () => {
  const [timings, setTimings] = useState<Record<string, number>>({});

  const timeOperation = async <T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await operation();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      setTimings(prev => ({
        ...prev,
        [operationName]: duration
      }));
      
      console.log(`Operation "${operationName}" took ${duration.toFixed(2)}ms`);
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.error(`Operation "${operationName}" failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  };

  return { timings, timeOperation };
};
