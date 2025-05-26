
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart as BarChartIcon } from 'lucide-react';
import { useCostByAccount } from '@/hooks/api/dashboard/useCostByAccount';
import { useDashboardFilters } from '@/contexts/DashboardFiltersContext';
import { DASHBOARD_CONSTANTS } from '@/lib/dashboard-constants';
import ErrorBoundary from '@/components/ui/error-boundary';
import { memo } from 'react';

const CostByAccountChart = memo(() => {
  const { filters } = useDashboardFilters();
  const { data: enrichedData, isLoading, isError, error } = useCostByAccount(filters);

  // Debug logging
  console.log('CostByAccount - filters:', filters);
  console.log('CostByAccount - data:', enrichedData);
  console.log('CostByAccount - isLoading:', isLoading);
  console.log('CostByAccount - isError:', isError);
  console.log('CostByAccount - error:', error);

  if (isError) {
    console.error('CostByAccount error:', error);
    return (
      <ErrorBoundary title="Feil ved lasting av kostnader per konto">
        <div>En feil oppstod ved lasting av data: {error?.message}</div>
      </ErrorBoundary>
    );
  }

  if (isLoading) {
    return (
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChartIcon className="w-5 h-5 text-myhrvold-primary" />
            Kostnader per Konto
          </CardTitle>
          <CardDescription>Reklamasjonskostnader fordelt på kontoer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Laster data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Check if we have data
  if (!enrichedData || enrichedData.length === 0) {
    return (
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChartIcon className="w-5 h-5 text-myhrvold-primary" />
            Kostnader per Konto
          </CardTitle>
          <CardDescription>Reklamasjonskostnader fordelt på kontoer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-gray-500">Ingen data tilgjengelig for valgt periode</div>
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
          Kostnader per Konto
        </CardTitle>
        <CardDescription>Reklamasjonskostnader fordelt på kontoer</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer 
          width={DASHBOARD_CONSTANTS.CHART_DIMENSIONS.WIDTH} 
          height={DASHBOARD_CONSTANTS.CHART_DIMENSIONS.HEIGHT}
        >
          <BarChart data={enrichedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="account"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis />
            <Tooltip 
              formatter={(value) => [`${Number(value).toLocaleString('nb-NO')} kr`, 'Beløp']}
              labelFormatter={(account) => {
                const item = enrichedData.find(d => d.account === account);
                return item?.displayName || `Konto ${account}`;
              }}
            />
            <Bar 
              dataKey="amount" 
              fill={DASHBOARD_CONSTANTS.COLORS.PRIMARY} 
              radius={[4, 4, 0, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});

CostByAccountChart.displayName = 'CostByAccountChart';

export default CostByAccountChart;
