
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart as BarChartIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StackedBarData {
  month: string;
  [key: string]: string | number;
}

interface StackedBarChartProps {
  data: StackedBarData[];
  isLoading: boolean;
  accountKeys: string[];
  accountColors: Record<string, string>;
}

const StackedBarChart = ({ data, isLoading, accountKeys, accountColors }: StackedBarChartProps) => {
  const navigate = useNavigate();

  const handleBarClick = (data: any, month: string) => {
    // Find the highest value account for this month
    const maxAccount = accountKeys.reduce((max, key) => 
      (data[key] || 0) > (data[max] || 0) ? key : max
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
          <BarChart data={data} onClick={(data) => data?.activeLabel && handleBarClick(data.activePayload?.[0]?.payload, data.activeLabel)}>
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
                style={{ cursor: 'pointer' }}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default StackedBarChart;
