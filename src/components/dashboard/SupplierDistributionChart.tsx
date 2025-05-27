
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { useSupplierDistribution } from '@/hooks/api/dashboard/useSupplierDistribution';
import { useDashboardFilters } from '@/contexts/DashboardFiltersContext';
import { DASHBOARD_CONSTANTS } from '@/lib/dashboard-constants';
import { EnhancedErrorBoundary } from '@/components/shared/EnhancedErrorBoundary';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { memo } from 'react';

const SupplierDistributionChart = memo(() => {
  const { filters } = useDashboardFilters();
  const { data: supplierData, isLoading, isError, error } = useSupplierDistribution(filters);

  if (isError) {
    console.error('SupplierDistribution error:', error);
    return (
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-myhrvold-primary" />
            Leverandørfordeling
          </CardTitle>
          <CardDescription>Andel reklamasjonskostnader per leverandør</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Kunne ikke laste leverandørdata. {error?.message || 'Ukjent feil'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-myhrvold-primary" />
            Leverandørfordeling
          </CardTitle>
          <CardDescription>Andel reklamasjonskostnader per leverandør</CardDescription>
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
  if (!supplierData || supplierData.length === 0) {
    return (
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-myhrvold-primary" />
            Leverandørfordeling
          </CardTitle>
          <CardDescription>Andel reklamasjonskostnader per leverandør</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex flex-col items-center justify-center text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
            <div className="text-gray-500">Ingen data tilgjengelig for valgt periode</div>
            <div className="text-sm text-gray-400 mt-2">
              Prøv å justere datofiltrene eller sjekk om det finnes kostnadsdata
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <EnhancedErrorBoundary 
      title="Feil i leverandørfordeling"
      level="error"
      component="SupplierDistributionChart"
    >
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-myhrvold-primary" />
            Leverandørfordeling
          </CardTitle>
          <CardDescription>Andel reklamasjonskostnader per leverandør</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer 
            width={DASHBOARD_CONSTANTS.CHART_DIMENSIONS.WIDTH} 
            height={DASHBOARD_CONSTANTS.CHART_DIMENSIONS.HEIGHT}
          >
            <PieChart>
              <Pie
                data={supplierData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {supplierData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name, props) => [
                  `${value}%`, 
                  'Andel',
                  `Beløp: ${props.payload?.amount?.toLocaleString('nb-NO')} kr`
                ]} 
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {supplierData?.map((supplier, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: supplier.color }}></div>
                <span className="text-sm text-gray-600 truncate" title={supplier.name}>
                  {supplier.name} ({supplier.value}%)
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </EnhancedErrorBoundary>
  );
});

SupplierDistributionChart.displayName = 'SupplierDistributionChart';

export default SupplierDistributionChart;
