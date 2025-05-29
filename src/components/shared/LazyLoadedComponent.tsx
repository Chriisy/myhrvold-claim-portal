
import React, { Suspense } from 'react';
import { OptimizedLoadingStates } from './OptimizedLoadingStates';

interface LazyLoadedComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  error?: React.ReactNode;
}

export const LazyLoadedComponent: React.FC<LazyLoadedComponentProps> = ({
  children,
  fallback,
  error
}) => {
  const defaultFallback = fallback || <OptimizedLoadingStates.Dashboard />;

  return (
    <Suspense fallback={defaultFallback}>
      {children}
    </Suspense>
  );
};

// HOC for lazy loading components
export const withLazyLoading = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = React.lazy(() => Promise.resolve({ default: Component }));
  
  return React.forwardRef<any, P>((props, ref) => (
    <LazyLoadedComponent fallback={fallback}>
      <LazyComponent {...props} ref={ref} />
    </LazyLoadedComponent>
  ));
};
