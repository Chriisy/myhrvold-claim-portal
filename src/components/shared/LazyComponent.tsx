
import React, { Suspense, lazy } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface LazyComponentProps {
  componentImport: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  retryCount?: number;
  children?: any;
}

export const LazyComponent: React.FC<LazyComponentProps> = ({
  componentImport,
  fallback,
  errorFallback,
  retryCount = 3,
  ...props
}) => {
  const [error, setError] = React.useState<Error | null>(null);
  const [retryAttempts, setRetryAttempts] = React.useState(0);

  const LazyLoadedComponent = React.useMemo(() => {
    return lazy(async () => {
      try {
        const component = await componentImport();
        setError(null);
        return component;
      } catch (err) {
        console.error('Lazy loading failed:', err);
        setError(err as Error);
        throw err;
      }
    });
  }, [componentImport, retryAttempts]);

  const defaultFallback = (
    <Card className="animate-pulse">
      <CardHeader>
        <Skeleton className="w-48 h-6" />
        <Skeleton className="w-72 h-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="w-full h-64" />
      </CardContent>
    </Card>
  );

  const handleRetry = () => {
    if (retryAttempts < retryCount) {
      setRetryAttempts(prev => prev + 1);
      setError(null);
    }
  };

  if (error && retryAttempts >= retryCount) {
    return (
      errorFallback || (
        <Card className="border-red-200">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">Kunne ikke laste komponent</p>
            <button 
              onClick={handleRetry}
              className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Prøv igjen
            </button>
          </CardContent>
        </Card>
      )
    );
  }

  return (
    <Suspense fallback={fallback || defaultFallback}>
      <LazyLoadedComponent {...props} />
    </Suspense>
  );
};
