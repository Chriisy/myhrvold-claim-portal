
import React, { Suspense, lazy, ComponentType } from 'react';
import { OptimizedLoadingStates } from './OptimizedLoadingStates';
import { ImprovedErrorBoundary } from './ImprovedErrorBoundary';

interface LazyComponentOptions {
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  preload?: boolean;
}

// Enhanced lazy loading with better error handling and preloading
export const createOptimizedLazyComponent = <P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: LazyComponentOptions = {}
) => {
  const LazyComponent = lazy(importFn);
  
  // Preload component if requested
  if (options.preload) {
    // Preload in idle time
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        importFn();
      });
    } else {
      setTimeout(() => {
        importFn();
      }, 100);
    }
  }

  const WrappedComponent = React.forwardRef<any, P>((props, ref) => (
    <ImprovedErrorBoundary 
      title="Komponent feil"
      fallback={options.errorFallback}
    >
      <Suspense fallback={options.fallback || <OptimizedLoadingStates />}>
        <LazyComponent {...props} ref={ref} />
      </Suspense>
    </ImprovedErrorBoundary>
  ));

  // Fix: Get displayName from the lazy component's _payload if available
  const componentName = (LazyComponent as any)._payload?.displayName || 'Component';
  WrappedComponent.displayName = `OptimizedLazy(${componentName})`;
  
  // Add preload method to component
  (WrappedComponent as any).preload = importFn;
  
  return WrappedComponent;
};

// Hook for preloading components on hover/focus
export const usePreloadOnHover = (preloadFn: () => void) => {
  const handleMouseEnter = React.useCallback(() => {
    preloadFn();
  }, [preloadFn]);

  const handleFocus = React.useCallback(() => {
    preloadFn();
  }, [preloadFn]);

  return {
    onMouseEnter: handleMouseEnter,
    onFocus: handleFocus
  };
};

// Virtual scrolling component for large lists
export const VirtualizedList = React.memo<{
  items: any[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: any, index: number) => React.ReactNode;
}>(({ items, itemHeight, containerHeight, renderItem }) => {
  const [scrollTop, setScrollTop] = React.useState(0);

  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleCount + 1, items.length);

  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;

  const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div 
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

VirtualizedList.displayName = 'VirtualizedList';
