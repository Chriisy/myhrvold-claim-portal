
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { memo } from 'react';

export const TableSkeleton = memo(() => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-48" />
    </CardHeader>
    <CardContent className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </CardContent>
  </Card>
));

TableSkeleton.displayName = 'TableSkeleton';

export const StatCardsSkeleton = memo(() => (
  <div className="grid gap-4 md:grid-cols-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <Card key={i}>
        <CardContent className="pt-6">
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-24" />
        </CardContent>
      </Card>
    ))}
  </div>
));

StatCardsSkeleton.displayName = 'StatCardsSkeleton';

export const DashboardSkeleton = memo(() => (
  <div className="space-y-6">
    <div className="flex items-center gap-4">
      <Skeleton className="h-8 w-8" />
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
    <StatCardsSkeleton />
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  </div>
));

DashboardSkeleton.displayName = 'DashboardSkeleton';
