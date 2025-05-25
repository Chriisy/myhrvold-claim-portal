
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';
import { DonutChartData } from '@/types/dashboard';
import { DASHBOARD_CONSTANTS } from '@/lib/dashboard-constants';
import { memo } from 'react';

interface DonutChartProps {
  data: DonutChartData[];
  title: string;
  description: string;
}

const DonutChart = memo(({ data, title, description }: DonutChartProps) => {
  if (!data?.length) {
    return (
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-myhrvold-primary" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
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
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer 
          width={DASHBOARD_CONSTANTS.CHART_DIMENSIONS.WIDTH} 
          height={DASHBOARD_CONSTANTS.CHART_DIMENSIONS.HEIGHT}
        >
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={DASHBOARD_CONSTANTS.CHART_DIMENSIONS.DONUT_INNER_RADIUS}
              outerRadius={DASHBOARD_CONSTANTS.CHART_DIMENSIONS.DONUT_OUTER_RADIUS}
              paddingAngle={DASHBOARD_CONSTANTS.CHART_DIMENSIONS.PADDING_ANGLE}
              dataKey="value"
              aria-label={title}
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

DonutChart.displayName = 'DonutChart';

export default DonutChart;
