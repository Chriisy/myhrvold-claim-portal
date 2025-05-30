
import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  mountTime: number;
}

export const usePerformanceMonitor = (componentName: string) => {
  const renderStart = useRef<number>(0);
  const mountStart = useRef<number>(0);

  // Track component mount
  useEffect(() => {
    mountStart.current = performance.now();
    console.log(`${componentName} mounted at:`, mountStart.current);
    
    return () => {
      const unmountTime = performance.now();
      console.log(`${componentName} unmounted. Lifecycle: ${unmountTime - mountStart.current}ms`);
    };
  }, [componentName]);

  const startRender = () => {
    renderStart.current = performance.now();
  };

  const endRender = () => {
    const renderTime = performance.now() - renderStart.current;
    if (renderTime > 16) { // More than one frame
      console.warn(`${componentName} slow render: ${renderTime.toFixed(2)}ms`);
    }
    return renderTime;
  };

  return { startRender, endRender };
};
