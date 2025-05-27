
import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface OptimizedKpiCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon: LucideIcon;
  loading?: boolean;
}

const OptimizedKpiCard = memo<OptimizedKpiCardProps>(({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  loading = false 
}) => {
  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gray-200" />
            <div className="space-y-2">
              <div className="w-24 h-4 bg-gray-200 rounded" />
              <div className="w-16 h-6 bg-gray-200 rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-myhrvold-primary/10 rounded-lg flex items-center justify-center">
            <Icon className="w-6 h-6 text-myhrvold-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-myhrvold-primary">{value}</p>
              {change && (
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    change.type === 'increase'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {change.type === 'increase' ? '+' : '-'}{Math.abs(change.value)}%
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

OptimizedKpiCard.displayName = 'OptimizedKpiCard';

export { OptimizedKpiCard };
