
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ReactNode } from 'react';
import { ImprovedErrorBoundary } from '@/components/shared/ImprovedErrorBoundary';

interface DashboardSectionProps {
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  children: ReactNode;
  className?: string;
}

const DashboardSection = ({ 
  title, 
  description, 
  icon: Icon, 
  isLoading, 
  isError, 
  error, 
  onRetry, 
  children,
  className = "card-hover"
}: DashboardSectionProps) => {
  if (isError) {
    return (
      <ImprovedErrorBoundary
        title={title || "Feil ved lasting av data"}
        description={error?.message || 'En uventet feil oppstod'}
        onReset={onRetry}
      >
        <div>This content is handled by the error boundary</div>
      </ImprovedErrorBoundary>
    );
  }

  if (isLoading) {
    return (
      <Card className={className}>
        {(title || description) && (
          <CardHeader>
            {title && (
              <CardTitle className="flex items-center gap-2">
                {Icon && <Icon className="w-5 h-5 text-myhrvold-primary" />}
                {title}
              </CardTitle>
            )}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>
          <div className="h-[300px] space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <div className="flex gap-2 mt-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-14" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};

export default DashboardSection;
