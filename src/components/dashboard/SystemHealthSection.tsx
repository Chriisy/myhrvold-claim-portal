
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import { PerformanceMonitor } from '@/components/dashboard/PerformanceMonitor';
import { SystemHealthCheck } from '@/components/dashboard/SystemHealthCheck';
import { ImprovedErrorBoundary } from '@/components/shared/ImprovedErrorBoundary';
import { useDashboardLayout } from '@/hooks/ui/useDashboardLayout';

export const SystemHealthSection = () => {
  const { getGridClasses } = useDashboardLayout();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Systemovervåkning
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`grid gap-6 ${getGridClasses()}`}>
          <ImprovedErrorBoundary title="Feil ved lasting av ytelsesmonitor">
            <PerformanceMonitor />
          </ImprovedErrorBoundary>
          
          <ImprovedErrorBoundary title="Feil ved lasting av systemhelse">
            <SystemHealthCheck />
          </ImprovedErrorBoundary>
        </div>
      </CardContent>
    </Card>
  );
};
