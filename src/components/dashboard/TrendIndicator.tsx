
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface TrendIndicatorProps {
  percentage: number;
  direction: 'up' | 'down' | 'stable';
  isGoodTrend?: boolean;
}

export const TrendIndicator = ({ percentage, direction, isGoodTrend = true }: TrendIndicatorProps) => {
  if (direction === 'stable' || percentage === 0) {
    return (
      <div className="flex items-center gap-1 text-gray-500">
        <Minus className="w-3 h-3" />
        <span className="text-xs">0%</span>
      </div>
    );
  }

  // Determine if this specific trend direction is good or bad
  const isPositiveTrend = (direction === 'up' && isGoodTrend) || (direction === 'down' && !isGoodTrend);
  const colorClass = isPositiveTrend ? 'text-green-600' : 'text-red-600';
  
  return (
    <div className={`flex items-center gap-1 ${colorClass}`}>
      {direction === 'up' ? (
        <ArrowUp className="w-3 h-3" />
      ) : (
        <ArrowDown className="w-3 h-3" />
      )}
      <span className="text-xs font-medium">{percentage}%</span>
    </div>
  );
};
