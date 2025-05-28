
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Activity, Clock, Database, Users } from 'lucide-react';
import { useSystemHealth } from '@/hooks/useSystemHealth';
import { UnifiedErrorBoundary } from '@/components/shared/UnifiedErrorBoundary';

export const PerformanceMonitor = () => {
  const { data: metrics, isLoading, error, refetch } = useSystemHealth();
  const [renderTime, setRenderTime] = useState(0);

  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      setRenderTime(endTime - startTime);
    };
  }, []);

  if (error) {
    return (
      <UnifiedErrorBoundary
        title="Performance Monitor"
        onError={() => refetch()}
      >
        <div>Feil ved lasting av systemmetrikker: {error}</div>
      </UnifiedErrorBoundary>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Ytelsesmonitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-600">Samler inn metrikker...</p>
          </div>
        ) : metrics ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">DB Responstid</span>
                </div>
                <div className="text-2xl font-bold">
                  {metrics.dbConnectionTime.toFixed(0)}ms
                </div>
                <Progress 
                  value={Math.min((metrics.dbConnectionTime / 1000) * 100, 100)} 
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">Minnebruk</span>
                </div>
                <div className="text-2xl font-bold">
                  {metrics.memoryUsage.toFixed(1)}MB
                </div>
                <Progress 
                  value={Math.min((metrics.memoryUsage / 100) * 100, 100)} 
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium">Render Tid</span>
                </div>
                <div className="text-2xl font-bold">
                  {renderTime.toFixed(1)}ms
                </div>
                <Progress 
                  value={Math.min((renderTime / 100) * 100, 100)} 
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium">Aktive Brukere</span>
                </div>
                <div className="text-2xl font-bold">
                  {metrics.activeUsers}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t text-xs text-gray-500">
              Sist oppdatert: {metrics.lastUpdate.toLocaleTimeString('nb-NO')}
            </div>
          </>
        ) : (
          <p className="text-gray-600">Ingen metrikker tilgjengelig</p>
        )}
      </CardContent>
    </Card>
  );
};
