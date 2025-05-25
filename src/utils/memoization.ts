
import { useMemo, useRef } from 'react';

// Deep comparison for objects
export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;
  
  if (typeof a === 'object') {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    
    if (aKeys.length !== bKeys.length) return false;
    
    for (let key of aKeys) {
      if (!bKeys.includes(key)) return false;
      if (!deepEqual(a[key], b[key])) return false;
    }
    
    return true;
  }
  
  return a === b;
}

// Memoization hook with deep comparison
export function useDeepMemo<T>(factory: () => T, deps: any[]): T {
  const ref = useRef<{ deps: any[]; value: T }>();
  
  if (!ref.current || !deepEqual(ref.current.deps, deps)) {
    ref.current = {
      deps,
      value: factory()
    };
  }
  
  return ref.current.value;
}

// Debounced memoization
export function useDebouncedMemo<T>(
  factory: () => T,
  deps: any[],
  delay: number = 300
): T {
  const [debouncedDeps, setDebouncedDeps] = React.useState(deps);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedDeps(deps);
    }, delay);
    
    return () => clearTimeout(timer);
  }, deps);
  
  return useMemo(factory, debouncedDeps);
}

// Memoization for expensive calculations
export class CalculationMemo {
  private static cache = new Map<string, { value: any; timestamp: number }>();
  private static TTL = 5 * 60 * 1000; // 5 minutes
  
  static memoize<T>(key: string, calculation: () => T): T {
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.TTL) {
      return cached.value;
    }
    
    const value = calculation();
    this.cache.set(key, { value, timestamp: Date.now() });
    
    return value;
  }
  
  static clear(): void {
    this.cache.clear();
  }
}
