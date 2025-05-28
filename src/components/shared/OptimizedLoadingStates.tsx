
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export const OptimizedLoadingStates: React.FC = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-4 w-[200px]" />
      <Skeleton className="h-4 w-[150px]" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-[100px] w-full" />
    </CardContent>
  </Card>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="w-24 h-4" />
                <Skeleton className="w-16 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="w-48 h-6" />
            <Skeleton className="w-72 h-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="w-full h-[300px]" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export const TableSkeleton: React.FC = () => (
  <Card>
    <CardHeader>
      <Skeleton className="w-48 h-6" />
    </CardHeader>
    <CardContent className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded" />
          <div className="space-y-2 flex-1">
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-3/4 h-3" />
          </div>
          <Skeleton className="w-20 h-4" />
        </div>
      ))}
    </CardContent>
  </Card>
);

export const SpinnerLoader: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center p-8 space-y-4">
    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    <p className="text-sm text-muted-foreground">{message}</p>
  </div>
);
