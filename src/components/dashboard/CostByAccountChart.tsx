
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart as BarChartIcon } from 'lucide-react';
import { useCostByAccount } from '@/hooks/useDashboardData';
import { useAccountCodes } from '@/hooks/useAccountCodes';
import { useDashboardFilters } from '@/contexts/DashboardFiltersContext';
import { useMemo } from 'react';

const CostByAccountChart = () => {
  const { filters } = useDashboardFilters();
  const { data: accountData, isLoading: costLoading } = useCostByAccount(filters);
  const { data: accountCodes, isLoading: accountsLoading } = useAccountCodes();

  const enrichedData = useMemo(() => {
    if (!accountData || !accountCodes) return [];
    
    return accountData.map(item => {
      const account = accountCodes.find(acc => acc.konto_nr === item.account);
      return {
        ...item,
        accountName: account?.type || `Konto ${item.account}`,
        displayName: account ? `${item.account} - ${account.type}` : item.account.toString()
      };
    });
  }, [accountData, accountCodes]);

  if (costLoading || accountsLoading) {
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
        <ResponsiveContainer width="100%" height={300}>
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
            <Bar dataKey="amount" fill="#223368" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default CostByAccountChart;
