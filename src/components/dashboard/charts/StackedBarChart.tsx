
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart as BarChartIcon } from 'lucide-react';
import { StackedBarData } from '@/types/dashboard';
import { DASHBOARD_CONSTANTS } from '@/lib/dashboard-constants';
import { memo } from 'react';

interface StackedBarChartProps {
  data: StackedBarData[];
  accountKeys: string[];
  accountColors: Record<string, string>;
  onBarClick?: (data: any, month: string) => void;
}

const StackedBarChart = memo(({ data, accountKeys, accountColors, onBarClick }: StackedBarChartProps) => {
  if (!data?.length) {
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
        <ResponsiveContainer 
          width={DASHBOARD_CONSTANTS.CHART_DIMENSIONS.WIDTH} 
          height={DASHBOARD_CONSTANTS.CHART_DIMENSIONS.HEIGHT}
        >
          <BarChart 
            data={data} 
            onClick={onBarClick ? (clickData) => 
              clickData?.activeLabel && onBarClick(clickData.activePayload?.[0]?.payload, clickData.activeLabel)
            : undefined}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [`${Number(value).toLocaleString('nb-NO')} kr`, `Konto ${name}`]}
              labelFormatter={(month) => `Måned: ${month}`}
            />
            {accountKeys.map((key) => (
              <Bar 
                key={key} 
                dataKey={key} 
                stackId="a" 
                fill={accountColors[key]} 
                radius={[0, 0, 0, 0]}
                style={onBarClick ? { cursor: 'pointer' } : undefined}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});

StackedBarChart.displayName = 'StackedBarChart';

export default StackedBarChart;
