
import { useCallback, useRef } from 'react';

export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    ((...args: Parameters<T>) => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    }) as T,
    [callback, delay]
  );
};

export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastCallRef = useRef<number>(0);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        return callback(...args);
      }
    }) as T,
    [callback, delay]
  );
};

export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map();
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

export const batchUpdates = <T>(
  updates: (() => void)[],
  batchSize: number = 10
): Promise<void> => {
  return new Promise((resolve) => {
    let currentIndex = 0;
    
    const processBatch = () => {
      const endIndex = Math.min(currentIndex + batchSize, updates.length);
      
      for (let i = currentIndex; i < endIndex; i++) {
        updates[i]();
      }
      
      currentIndex = endIndex;
      
      if (currentIndex < updates.length) {
        setTimeout(processBatch, 0);
      } else {
        resolve();
      }
    };
    
    processBatch();
  });
};
