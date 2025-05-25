import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart as BarChartIcon } from 'lucide-react';
import { useDashboardFilters } from '@/contexts/DashboardFiltersContext';
import { useStackedBarData } from '@/hooks/api/dashboard/useStackedBarData';
import { useNavigate } from 'react-router-dom';
import { memo } from 'react';

const OptimizedStackedBarChart = memo(() => {
  const { filters } = useDashboardFilters();
  const { data, isLoading } = useStackedBarData(filters);
  const navigate = useNavigate();

  const handleBarClick = (clickData: any, month: string) => {
    if (!data?.accountKeys) return;
    
    // Find the highest value account for this month
    const maxAccount = data.accountKeys.reduce((max, key) => 
      (clickData[key] || 0) > (clickData[max] || 0) ? key : max
    );
    navigate(`/claims?konto=${maxAccount}&month=${month}`);
  };

  if (isLoading) {
    return (
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChartIcon className="w-5 h-5 text-myhrvold-primary" />
            Kostnader per Måned (Topp 5 Kontoer)
          </CardTitle>
          <CardDescription>Månedlige kostnader fordelt på kontoer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Laster data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data?.data?.length) {
    return (
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChartIcon className="w-5 h-5 text-myhrvold-primary" />
            Kostnader per Måned (Topp 5 Kontoer)
          </CardTitle>
          <CardDescription>Månedlige kostnader fordelt på kontoer</CardDescription>
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
          <BarChartIcon className="w-5 h-5 text-myhrvold-primary" />
          Kostnader per Måned (Topp 5 Kontoer)
        </CardTitle>
        <CardDescription>Månedlige kostnader fordelt på kontoer - klikk for å filtrere</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={data.data} 
            onClick={(clickData) => clickData?.activeLabel && handleBarClick(clickData.activePayload?.[0]?.payload, clickData.activeLabel)}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [`${Number(value).toLocaleString('nb-NO')} kr`, `Konto ${name}`]}
              labelFormatter={(month) => `Måned: ${month}`}
            />
            {data.accountKeys.map((key) => (
              <Bar 
                key={key} 
                dataKey={key} 
                stackId="a" 
                fill={data.accountColors[key]} 
                radius={[0, 0, 0, 0]}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});

OptimizedStackedBarChart.displayName = 'OptimizedStackedBarChart';

export default OptimizedStackedBarChart;
