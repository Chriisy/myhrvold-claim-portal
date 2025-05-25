
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, BarChart3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays, format } from 'date-fns';

interface TrendData {
  date: string;
  claims: number;
  costs: number;
  warranty: number;
}

export const TrendAnalysisChart = () => {
  const { data: trendData, isLoading } = useQuery({
    queryKey: ['trend-analysis'],
    queryFn: async (): Promise<TrendData[]> => {
      const endDate = new Date();
      const startDate = subDays(endDate, 30);

      // Get claims data for the last 30 days
      const { data: claims } = await supabase
        .from('claims')
        .select('created_at, warranty')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .is('deleted_at', null);

      // Get cost data for the same period
      const { data: costs } = await supabase
        .from('cost_line')
        .select('date, amount, claims!inner(warranty)')
        .gte('date', format(startDate, 'yyyy-MM-dd'))
        .lte('date', format(endDate, 'yyyy-MM-dd'));

      // Group data by date
      const dateGroups: Record<string, { claims: number; costs: number; warranty: number }> = {};

      // Initialize all dates with zero values
      for (let i = 0; i <= 30; i++) {
        const date = format(subDays(endDate, i), 'yyyy-MM-dd');
        dateGroups[date] = { claims: 0, costs: 0, warranty: 0 };
      }

      // Add claims data
      claims?.forEach(claim => {
        const date = format(new Date(claim.created_at), 'yyyy-MM-dd');
        if (dateGroups[date]) {
          dateGroups[date].claims += 1;
          if (claim.warranty) {
            dateGroups[date].warranty += 1;
          }
        }
      });

      // Add cost data
      costs?.forEach(cost => {
        const date = cost.date;
        if (dateGroups[date]) {
          dateGroups[date].costs += Number(cost.amount);
        }
      });

      // Convert to array and sort by date
      return Object.entries(dateGroups)
        .map(([date, data]) => ({
          date: format(new Date(date), 'dd/MM'),
          ...data
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-14); // Show last 14 days
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Trend Analyse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  const totalClaims = trendData?.reduce((sum, day) => sum + day.claims, 0) || 0;
  const totalWarranty = trendData?.reduce((sum, day) => sum + day.warranty, 0) || 0;
  const warrantyRate = totalClaims > 0 ? Math.round((totalWarranty / totalClaims) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-myhrvold-primary" />
            Trend Analyse (14 dager)
          </div>
          <Badge variant="outline" className="text-xs">
            Live data
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalClaims}</div>
            <div className="text-xs text-muted-foreground">Totale reklamasjoner</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{totalWarranty}</div>
            <div className="text-xs text-muted-foreground">Garanti saker</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{warrantyRate}%</div>
            <div className="text-xs text-muted-foreground">Garanti rate</div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              fontSize={12}
              tick={{ fill: '#666' }}
            />
            <YAxis fontSize={12} tick={{ fill: '#666' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="claims" 
              stroke="#3B82F6" 
              strokeWidth={2}
              name="Reklamasjoner"
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="warranty" 
              stroke="#10B981" 
              strokeWidth={2}
              name="Garanti"
              dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
