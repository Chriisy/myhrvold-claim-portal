
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Clock, 
  Shield, 
  AlertTriangle,
  DollarSign,
  Activity
} from 'lucide-react';
import { useLiveKPIs } from '@/hooks/useLiveKPIs';

export const LiveKPICards = () => {
  const { data: kpis, isLoading, error } = useLiveKPIs();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !kpis) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <p className="text-red-600">Kunne ikke laste live KPI-er</p>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = () => {
    switch (kpis.trendDirection) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = () => {
    switch (kpis.trendDirection) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span>Reklamasjoner i dag</span>
            <Activity className="w-4 h-4 text-myhrvold-primary" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{kpis.todayClaims}</div>
            <div className={`flex items-center gap-1 ${getTrendColor()}`}>
              {getTrendIcon()}
              <Badge variant="outline" className="border-current text-current">
                {kpis.trendDirection === 'up' ? '+' : kpis.trendDirection === 'down' ? '-' : '='}
              </Badge>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {kpis.weekClaims} denne uke | {kpis.monthClaims} denne måned
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span>Snitt løsningstid</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.avgResolutionTime}</div>
          <p className="text-xs text-muted-foreground">
            dager (denne uke)
          </p>
          <Badge 
            variant={kpis.avgResolutionTime <= 3 ? "default" : kpis.avgResolutionTime <= 7 ? "secondary" : "destructive"}
            className="mt-2 text-xs"
          >
            {kpis.avgResolutionTime <= 3 ? 'Excellent' : kpis.avgResolutionTime <= 7 ? 'Bra' : 'Trenger forbedring'}
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span>Garanti recovery</span>
            <Shield className="w-4 h-4 text-green-600" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.warrantyRecoveryRate}%</div>
          <p className="text-xs text-muted-foreground">
            av reklamasjoner denne måned
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(kpis.warrantyRecoveryRate, 100)}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span>Dagens insight</span>
            <AlertTriangle className="w-4 h-4 text-orange-600" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Topp kategori:</p>
              <p className="font-semibold text-sm">{kpis.topIssueCategory}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Potensiell besparelse:</p>
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-green-600" />
                <span className="font-bold text-green-600">
                  {kpis.costSavingsToday.toLocaleString()} kr
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
