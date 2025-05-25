
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';
import { useDashboardFilters } from '@/contexts/DashboardFiltersContext';
import { useRootCauseData } from '@/hooks/dashboard';
import { memo } from 'react';

const OptimizedDonutChart = memo(() => {
  const { filters } = useDashboardFilters();
  const { data, isLoading } = useRootCauseData(filters);

  if (isLoading) {
    return (
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-myhrvold-primary" />
            Rotårsak Fordeling (Siste 6 måneder)
          </CardTitle>
          <CardDescription>Fordeling av rotårsaker for reklamasjoner</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Laster data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data?.length) {
    return (
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-myhrvold-primary" />
            Rotårsak Fordeling (Siste 6 måneder)
          </CardTitle>
          <CardDescription>Fordeling av rotårsaker for reklamasjoner</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-gray-400">Ingen data tilgjengelig</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="w-5 h-5 text-myhrvold-primary" />
          Rotårsak Fordeling (Siste 6 måneder)
        </CardTitle>
        <CardDescription>Fordeling av rotårsaker for reklamasjoner</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              aria-label="Rotårsak Fordeling"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value}`, 'Antall']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});

OptimizedDonutChart.displayName = 'OptimizedDonutChart';

export default OptimizedDonutChart;
