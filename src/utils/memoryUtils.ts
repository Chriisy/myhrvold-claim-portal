
// Simplified memory utils to prevent interference with React hooks
export interface MemoryLeakDetector {
  addCleanup: (cleanup: () => void) => void;
  cleanup: () => void;
}

export const createMemoryLeakDetector = (): MemoryLeakDetector => {
  const cleanupCallbacks: (() => void)[] = [];
  
  return {
    addCleanup: (cleanup: () => void) => {
      cleanupCallbacks.push(cleanup);
    },
    cleanup: () => {
      cleanupCallbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.warn('Memory cleanup error:', error);
        }
      });
      cleanupCallbacks.length = 0;
    }
  };
};

// Simple memory monitoring utility
export const trackMemoryUsage = () => {
  if (typeof window !== 'undefined' && 'performance' in window && 'memory' in (window.performance as any)) {
    const memory = (window.performance as any).memory;
    console.log('Memory usage:', {
      used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + ' MB',
      total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + ' MB',
      limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + ' MB'
    });
  }
};
