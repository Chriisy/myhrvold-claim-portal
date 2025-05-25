
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, BarChart3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays, format } from 'date-fns';
import { useMemo } from 'react';

interface TrendData {
  date: string;
  claims: number;
  costs: number;
  warranty: number;
}

interface ClaimData {
  created_at: string;
  warranty: boolean;
}

interface CostData {
  date: string;
  amount: number; // Changed from string to number to match actual data
  claims: {
    warranty: boolean;
  };
}

export const TrendAnalysisChart = () => {
  const { data: trendData, isLoading, error } = useQuery({
    queryKey: ['trend-analysis'],
    queryFn: async (): Promise<TrendData[]> => {
      const endDate = new Date();
      const startDate = subDays(endDate, 30);

      try {
        const [claimsResult, costsResult] = await Promise.all([
          supabase
            .from('claims')
            .select('created_at, warranty')
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString())
            .is('deleted_at', null),
          
          supabase
            .from('cost_line')
            .select('date, amount, claims!inner(warranty)')
            .gte('date', format(startDate, 'yyyy-MM-dd'))
            .lte('date', format(endDate, 'yyyy-MM-dd'))
        ]);

        if (claimsResult.error) {
          console.error('Error fetching claims for trend analysis:', claimsResult.error);
          throw new Error(`Claims fetch failed: ${claimsResult.error.message}`);
        }

        if (costsResult.error) {
          console.error('Error fetching costs for trend analysis:', costsResult.error);
        }

        const claims = claimsResult.data as ClaimData[] || [];
        const costs = costsResult.data as CostData[] || [];

        const dateGroups: Record<string, { claims: number; costs: number; warranty: number }> = {};

        for (let i = 0; i <= 30; i++) {
          const date = format(subDays(endDate, i), 'yyyy-MM-dd');
          dateGroups[date] = { claims: 0, costs: 0, warranty: 0 };
        }

        claims.forEach(claim => {
          if (!claim.created_at) return;
          
          try {
            const date = format(new Date(claim.created_at), 'yyyy-MM-dd');
            if (dateGroups[date]) {
              dateGroups[date].claims += 1;
              if (claim.warranty) {
                dateGroups[date].warranty += 1;
              }
            }
          } catch (dateError) {
            console.warn('Invalid date in claim:', claim.created_at);
          }
        });

        costs.forEach(cost => {
          if (!cost.date || !cost.amount) return;
          
          const date = cost.date;
          if (dateGroups[date]) {
            const amount = typeof cost.amount === 'number' ? cost.amount : parseFloat(String(cost.amount));
            if (!isNaN(amount)) {
              dateGroups[date].costs += amount;
            }
          }
        });

        return Object.entries(dateGroups)
          .map(([date, data]) => {
            try {
              return {
                date: format(new Date(date), 'dd/MM'),
                claims: data.claims,
                costs: Math.round(data.costs),
                warranty: data.warranty
              };
            } catch (dateError) {
              console.warn('Error formatting date:', date);
              return {
                date: date.slice(-5),
                claims: data.claims,
                costs: Math.round(data.costs),
                warranty: data.warranty
              };
            }
          })
          .sort((a, b) => {
            try {
              const dateA = new Date(a.date.split('/').reverse().join('-'));
              const dateB = new Date(b.date.split('/').reverse().join('-'));
              return dateA.getTime() - dateB.getTime();
            } catch {
              return 0;
            }
          })
          .slice(-14);
      } catch (error) {
        console.error('Error in trend analysis query:', error);
        throw error;
      }
    },
    refetchInterval: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

  const summary = useMemo(() => {
    if (!trendData || trendData.length === 0) {
      return {
        totalClaims: 0,
        totalWarranty: 0,
        warrantyRate: 0
      };
    }

    const totalClaims = trendData.reduce((sum, day) => sum + (day.claims || 0), 0);
    const totalWarranty = trendData.reduce((sum, day) => sum + (day.warranty || 0), 0);
    const warrantyRate = totalClaims > 0 ? Math.round((totalWarranty / totalClaims) * 100) : 0;

    return { totalClaims, totalWarranty, warrantyRate };
  }, [trendData]);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-red-500" />
            Trend Analyse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-red-600">
            <div className="text-center">
              <p>Feil ved lasting av trenddata</p>
              <p className="text-sm text-gray-500 mt-2">Prøv å laste siden på nytt</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
            <div className="text-2xl font-bold text-blue-600">{summary.totalClaims}</div>
            <div className="text-xs text-muted-foreground">Totale reklamasjoner</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{summary.totalWarranty}</div>
            <div className="text-xs text-muted-foreground">Garanti saker</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{summary.warrantyRate}%</div>
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
              labelFormatter={(label) => `Dato: ${label}`}
              formatter={(value, name) => [
                value,
                name === 'claims' ? 'Reklamasjoner' : 'Garanti'
              ]}
            />
            <Line 
              type="monotone" 
              dataKey="claims" 
              stroke="#3B82F6" 
              strokeWidth={2}
              name="claims"
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="warranty" 
              stroke="#10B981" 
              strokeWidth={2}
              name="warranty"
              dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
