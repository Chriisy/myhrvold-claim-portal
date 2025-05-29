
import React, { Suspense, ComponentType } from 'react';
import { OptimizedLoadingStates } from './OptimizedLoadingStates';

interface OptimizedLazyLoadingOptions {
  preload?: boolean;
  fallback?: React.ReactNode;
}

export const createOptimizedLazyComponent = <P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: OptimizedLazyLoadingOptions = {}
) => {
  const LazyComponent = React.lazy(importFn);
  
  // Preload if specified
  if (options.preload) {
    importFn();
  }
  
  return (props: P) => (
    <Suspense fallback={options.fallback || <OptimizedLoadingStates.Dashboard />}>
      <LazyComponent {...(props as any)} />
    </Suspense>
  );
};

export const withOptimizedLoading = <P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
) => {
  return (props: P) => (
    <Suspense fallback={fallback || <OptimizedLoadingStates.Dashboard />}>
      <Component {...(props as any)} />
    </Suspense>
  );
};
