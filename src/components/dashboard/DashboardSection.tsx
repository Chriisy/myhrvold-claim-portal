
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ReactNode } from 'react';

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
          <div className="h-[300px] flex flex-col items-center justify-center gap-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <div className="text-center">
              <p className="text-red-600 font-medium">Feil ved lasting av data</p>
              <p className="text-sm text-gray-500 mt-1">
                {error?.message || 'En uventet feil oppstod'}
              </p>
            </div>
            {onRetry && (
              <Button variant="outline" onClick={onRetry} className="mt-2">
                <RefreshCw className="w-4 h-4 mr-2" />
                Prøv igjen
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
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
