
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays } from 'date-fns';

interface SupplierPerformance {
  id: string;
  name: string;
  totalClaims: number;
  warrantyClaims: number;
  avgResolutionDays: number;
  totalCost: number;
  score: number;
  trend: 'improving' | 'declining' | 'stable';
}

export const SupplierPerformanceCards = () => {
  const { data: suppliers, isLoading } = useQuery({
    queryKey: ['supplier-performance'],
    queryFn: async (): Promise<SupplierPerformance[]> => {
      const thirtyDaysAgo = subDays(new Date(), 30);

      // Get claims with supplier data from last 30 days
      const { data: claims } = await supabase
        .from('claims')
        .select(`
          id,
          supplier_id,
          warranty,
          created_at,
          closed_at,
          suppliers(id, name)
        `)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .is('deleted_at', null)
        .not('supplier_id', 'is', null);

      // Get cost data for the same period
      const { data: costs } = await supabase
        .from('cost_line')
        .select(`
          amount,
          claims!inner(supplier_id, suppliers(name))
        `)
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (!claims || !costs) return [];

      // Group by supplier
      const supplierMap = new Map<string, {
        name: string;
        claims: any[];
        totalCost: number;
      }>();

      // Process claims
      claims.forEach(claim => {
        if (claim.suppliers) {
          const supplierId = claim.supplier_id;
          if (!supplierMap.has(supplierId)) {
            supplierMap.set(supplierId, {
              name: claim.suppliers.name,
              claims: [],
              totalCost: 0
            });
          }
          supplierMap.get(supplierId)!.claims.push(claim);
        }
      });

      // Process costs
      costs.forEach(cost => {
        if (cost.claims?.supplier_id) {
          const supplierId = cost.claims.supplier_id;
          if (supplierMap.has(supplierId)) {
            supplierMap.get(supplierId)!.totalCost += Number(cost.amount);
          }
        }
      });

      // Calculate performance metrics
      const suppliers: SupplierPerformance[] = Array.from(supplierMap.entries())
        .map(([id, data]) => {
          const totalClaims = data.claims.length;
          const warrantyClaims = data.claims.filter(c => c.warranty).length;
          
          // Calculate average resolution time for closed claims
          const closedClaims = data.claims.filter(c => c.closed_at);
          const avgResolutionDays = closedClaims.length > 0
            ? closedClaims.reduce((sum, claim) => {
                const created = new Date(claim.created_at);
                const closed = new Date(claim.closed_at);
                return sum + Math.floor((closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
              }, 0) / closedClaims.length
            : 0;

          // Calculate performance score (lower is better)
          // Based on: frequency of claims (40%), resolution time (30%), cost (30%)
          const claimFrequencyScore = Math.max(0, 100 - (totalClaims * 5));
          const resolutionTimeScore = Math.max(0, 100 - (avgResolutionDays * 5));
          const costScore = Math.max(0, 100 - (data.totalCost / 1000));
          
          const score = Math.round(
            (claimFrequencyScore * 0.4) + 
            (resolutionTimeScore * 0.3) + 
            (costScore * 0.3)
          );

          // Simple trend calculation (in reality, you'd compare with previous period)
          const trend: 'improving' | 'declining' | 'stable' = 
            score >= 80 ? 'improving' : 
            score <= 60 ? 'declining' : 'stable';

          return {
            id,
            name: data.name,
            totalClaims,
            warrantyClaims,
            avgResolutionDays: Math.round(avgResolutionDays),
            totalCost: data.totalCost,
            score,
            trend
          };
        })
        .sort((a, b) => b.score - a.score) // Sort by performance score
        .slice(0, 6); // Top 6 suppliers

      return suppliers;
    },
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leverandør Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'declining':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <TrendingDown className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          Leverandør Performance (30 dager)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suppliers?.map((supplier) => (
            <div key={supplier.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{supplier.name}</h3>
                  {getTrendIcon(supplier.trend)}
                </div>
                <Badge variant={getScoreBadgeVariant(supplier.score)}>
                  {supplier.score}/100
                </Badge>
              </div>
              
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Reklamasjoner</div>
                  <div className="font-semibold">{supplier.totalClaims}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Garanti</div>
                  <div className="font-semibold text-green-600">{supplier.warrantyClaims}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Snitt løsning</div>
                  <div className="font-semibold">{supplier.avgResolutionDays}d</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Total kostnad</div>
                  <div className="font-semibold">{supplier.totalCost.toLocaleString()}kr</div>
                </div>
              </div>

              <Progress value={supplier.score} className="h-2" />
            </div>
          ))}
          
          {suppliers?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Ingen leverandørdata tilgjengelig for siste 30 dager
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
