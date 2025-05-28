
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { memo } from 'react';
import { TrendIndicator } from './TrendIndicator';

interface TrendData {
  percentage: number;
  direction: 'up' | 'down' | 'stable';
}

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  link?: string;
  loading?: boolean;
  trend?: TrendData;
  isGoodTrend?: boolean;
}

const KpiCard = memo(({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  bgColor, 
  link, 
  loading, 
  trend,
  isGoodTrend = true
}: KpiCardProps) => {
  if (loading) {
    return (
      <Card className="animate-pulse border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            <div className="space-y-2">
              <div className="w-24 h-4 bg-gray-200 rounded"></div>
              <div className="w-16 h-6 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const CardComponent = () => (
    <Card className={`hover:shadow-md transition-shadow duration-200 border border-gray-200 ${link ? 'cursor-pointer hover:border-gray-300' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${bgColor}`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-myhrvold-primary">{value}</p>
              {trend && (
                <TrendIndicator 
                  percentage={trend.percentage} 
                  direction={trend.direction}
                  isGoodTrend={isGoodTrend}
                />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (link) {
    return (
      <Link to={link}>
        <CardComponent />
      </Link>
    );
  }

  return <CardComponent />;
});

KpiCard.displayName = 'KpiCard';

export default KpiCard;
