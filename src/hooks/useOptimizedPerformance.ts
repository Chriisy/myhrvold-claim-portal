
import { useCallback, useRef, useEffect } from 'react';
import { debounce } from 'lodash';

export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const debouncedCallback = useRef(debounce(callback, delay));

  useEffect(() => {
    debouncedCallback.current = debounce(callback, delay);
  }, [callback, delay]);

  return useCallback((...args: Parameters<T>) => {
    return debouncedCallback.current(...args);
  }, []) as T;
};

export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastRun = useRef(Date.now());

  return useCallback((...args: Parameters<T>) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = Date.now();
    }
  }, [callback, delay]) as T;
};

export const usePerformanceMonitor = (componentName: string) => {
  const renderStart = useRef<number>(0);
  const mountCount = useRef<number>(0);

  useEffect(() => {
    mountCount.current += 1;
    console.log(`${componentName} mounted (${mountCount.current} times)`);
    
    return () => {
      console.log(`${componentName} unmounted`);
    };
  }, [componentName]);

  const startRender = useCallback(() => {
    renderStart.current = performance.now();
  }, []);

  const endRender = useCallback(() => {
    const renderTime = performance.now() - renderStart.current;
    if (renderTime > 16) { // More than one frame at 60fps
      console.warn(`${componentName} slow render: ${renderTime.toFixed(2)}ms`);
    }
  }, [componentName]);

  return { startRender, endRender };
};
