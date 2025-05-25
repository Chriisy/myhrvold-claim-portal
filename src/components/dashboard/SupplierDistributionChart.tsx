
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useSupplierDistribution } from '@/hooks/api/dashboard/useSupplierDistribution';
import { useDashboardFilters } from '@/contexts/DashboardFiltersContext';

const SupplierDistributionChart = () => {
  const { filters } = useDashboardFilters();
  const { data: supplierData, isLoading } = useSupplierDistribution(filters);

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
        <ResponsiveContainer width="100%" height={300}>
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
            <Tooltip formatter={(value) => [`${value}%`, 'Andel']} />
          </PieChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {supplierData?.map((supplier, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: supplier.color }}></div>
              <span className="text-sm text-gray-600">{supplier.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SupplierDistributionChart;
