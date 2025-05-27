import React, { useCallback, useMemo, useRef } from 'react';

// Memoization utilities
export const createMemoizedSelector = <T, R>(
  selector: (data: T) => R,
  dependencies: any[] = []
) => {
  return useCallback(selector, dependencies);
};

// Performance utilities
export const measurePerformance = async <T>(
  name: string,
  fn: () => Promise<T> | T
): Promise<T> => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  
  console.log(`Performance: ${name} took ${(end - start).toFixed(2)}ms`);
  return result;
};

// Cache utilities
export class SimpleCache<T> {
  private cache = new Map<string, { data: T; timestamp: number }>();
  private ttl: number;

  constructor(ttlMs: number = 5 * 60 * 1000) { // 5 minutes default
    this.ttl = ttlMs;
  }

  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (
  callback: () => void,
  options: IntersectionObserverInit = {}
) => {
  const targetRef = useRef<HTMLElement>(null);

  const observer = useMemo(() => {
    return new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        callback();
      }
    }, options);
  }, [callback, options]);

  const observe = useCallback((element: HTMLElement) => {
    if (element) {
      observer.observe(element);
      targetRef.current = element;
    }
  }, [observer]);

  const unobserve = useCallback(() => {
    if (targetRef.current) {
      observer.unobserve(targetRef.current);
    }
  }, [observer]);

  return { observe, unobserve, targetRef };
};

// Bundle optimization - dynamic imports
export const lazyImport = <T extends Record<string, any>>(
  factory: () => Promise<T>,
  name: keyof T
) => {
  return React.lazy(() =>
    factory().then((module) => ({ default: module[name] }))
  );
};
