
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const KpiCardSkeleton = () => (
  <Card className="animate-pulse">
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
);

export const ChartSkeleton = ({ height = 300 }: { height?: number }) => (
  <Card>
    <CardHeader>
      <Skeleton className="w-48 h-6" />
      <Skeleton className="w-72 h-4" />
    </CardHeader>
    <CardContent>
      <Skeleton className="w-full" style={{ height }} />
    </CardContent>
  </Card>
);

export const TableSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="w-48 h-6" />
    </CardHeader>
    <CardContent className="space-y-4">
      {[...Array(5)].map((_, i) => (
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
