
export const createMemoryLeakDetector = () => {
  const subscribers = new Set<() => void>();
  const intervals = new Set<NodeJS.Timeout>();
  const timeouts = new Set<NodeJS.Timeout>();

  const addCleanup = (cleanup: () => void) => {
    subscribers.add(cleanup);
  };

  const addInterval = (intervalId: NodeJS.Timeout) => {
    intervals.add(intervalId);
  };

  const addTimeout = (timeoutId: NodeJS.Timeout) => {
    timeouts.add(timeoutId);
  };

  const cleanup = () => {
    subscribers.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    });
    
    intervals.forEach(clearInterval);
    timeouts.forEach(clearTimeout);
    
    subscribers.clear();
    intervals.clear();
    timeouts.clear();
  };

  return {
    addCleanup,
    addInterval,
    addTimeout,
    cleanup
  };
};

export const withMemoryCleanup = <T extends any[], R>(
  fn: (...args: T) => R,
  cleanup: () => void
) => {
  return (...args: T): R => {
    try {
      return fn(...args);
    } finally {
      cleanup();
    }
  };
};
