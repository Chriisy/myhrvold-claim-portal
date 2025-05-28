
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Eye } from 'lucide-react';
import { useRecentClaims } from '@/hooks/api/dashboard/useRecentClaims';
import { useDashboardFilters } from '@/contexts/DashboardFiltersContext';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { memo } from 'react';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Ny': return 'bg-orange-100 text-orange-800';
    case 'Avventer': return 'bg-blue-100 text-blue-800';
    case 'Godkjent': return 'bg-green-100 text-green-800';
    case 'Avslått': return 'bg-red-100 text-red-800';
    case 'Bokført': return 'bg-purple-100 text-purple-800';
    case 'Lukket': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const RecentClaimsTable = memo(() => {
  const { filters } = useDashboardFilters();
  const { data: recentClaims, isLoading } = useRecentClaims(filters);

  if (isLoading) {
    return (
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-myhrvold-primary" />
            Siste Reklamasjoner
          </CardTitle>
          <CardDescription>Oversikt over nylig opprettede reklamasjoner</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="w-24 h-4 bg-gray-200 rounded"></div>
                    <div className="w-32 h-3 bg-gray-200 rounded"></div>
                  </div>
                  <div className="w-16 h-6 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-myhrvold-primary" />
          Siste Reklamasjoner
        </CardTitle>
        <CardDescription>Oversikt over nylig opprettede reklamasjoner</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentClaims?.map((claim) => (
            <div key={claim.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-myhrvold-primary rounded-full"></div>
                <div>
                  <p className="font-medium text-myhrvold-primary">{claim.id}</p>
                  <p className="text-sm text-gray-600">{claim.customer_name || 'Ukjent kunde'}</p>
                  <p className="text-xs text-gray-500">{claim.machine_model}</p>
                </div>
              </div>
              <div className="text-right flex items-center gap-4">
                <div>
                  <Badge className={getStatusColor(claim.status)}>
                    {claim.status}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(claim.created_at), 'dd.MM.yyyy')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Kostnad</p>
                  <p className="font-semibold">{claim.totalCost.toLocaleString('nb-NO')} kr</p>
                </div>
                <Link to={`/claims/${claim.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Se
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link to="/claims">
            <Button variant="outline">
              Se alle reklamasjoner
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
});

RecentClaimsTable.displayName = 'RecentClaimsTable';

export default RecentClaimsTable;
