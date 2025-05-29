import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface NavigationTiming {
  route: string;
  loadTime: number;
  timestamp: number;
}

export const useNavigationPerformance = () => {
  const location = useLocation();
  const navigationStart = useRef<number>(0);
  const timings = useRef<NavigationTiming[]>([]);

  useEffect(() => {
    navigationStart.current = performance.now();
  }, [location.pathname]);

  useEffect(() => {
    const handleLoad = () => {
      const loadTime = performance.now() - navigationStart.current;
      const timing: NavigationTiming = {
        route: location.pathname,
        loadTime,
        timestamp: Date.now()
      };
      
      timings.current.push(timing);
      
      // Keep only last 20 measurements
      if (timings.current.length > 20) {
        timings.current = timings.current.slice(-20);
      }

      // Log slow navigations
      if (loadTime > 200) {
        console.warn(`Slow navigation to ${location.pathname}: ${loadTime.toFixed(2)}ms`);
      } else {
        console.log(`Navigation to ${location.pathname}: ${loadTime.toFixed(2)}ms`);
      }
    };

    // Wait for next tick to ensure component is rendered
    const timeoutId = setTimeout(handleLoad, 0);
    
    return () => clearTimeout(timeoutId);
  }, [location]);

  const getAverageLoadTime = (route?: string) => {
    const relevantTimings = route 
      ? timings.current.filter(t => t.route === route)
      : timings.current;
    
    if (relevantTimings.length === 0) return 0;
    
    return relevantTimings.reduce((sum, t) => sum + t.loadTime, 0) / relevantTimings.length;
  };

  const getTimings = () => [...timings.current];

  return {
    getAverageLoadTime,
    getTimings
  };
};
