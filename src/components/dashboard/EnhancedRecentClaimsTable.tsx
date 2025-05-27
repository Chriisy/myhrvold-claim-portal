
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { useRecentClaims } from '@/hooks/api/dashboard/useRecentClaims';
import { useDashboardFilters } from '@/contexts/DashboardFiltersContext';

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

export const EnhancedRecentClaimsTable = () => {
  const { filters } = useDashboardFilters();
  const { data: claims, isLoading, error } = useRecentClaims(filters);

  if (isLoading) {
    return (
      <div className="mobile-spacing lg:desktop-spacing">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse border rounded-lg mobile-padding">
            <div className="grid grid-cols-1 md:grid-cols-5 mobile-grid-gap">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-28"></div>
              </div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-body text-red-600">Feil ved lasting av nylige reklamasjoner</p>
      </div>
    );
  }

  if (!claims || claims.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-body text-muted-foreground">Ingen nylige reklamasjoner funnet</p>
      </div>
    );
  }

  return (
    <div className="mobile-spacing lg:desktop-spacing">
      {claims.map((claim) => (
        <div key={claim.id} className="border rounded-lg mobile-padding hover:bg-gray-50 transition-colors">
          <div className="grid grid-cols-1 md:grid-cols-5 mobile-grid-gap items-center">
            <div>
              <p className="text-body font-semibold text-myhrvold-primary">{claim.id.slice(0, 8)}...</p>
              <p className="text-body-small text-muted-foreground">{new Date(claim.created_at).toLocaleDateString('nb-NO')}</p>
            </div>
            <div>
              <p className="text-body font-medium">{claim.customer_name || 'Ukjent kunde'}</p>
              <p className="text-body-small text-muted-foreground">{claim.machine_model || 'Ingen maskin'}</p>
              {claim.part_number && (
                <p className="text-body-small text-blue-600 font-mono">Del: {claim.part_number}</p>
              )}
            </div>
            <div>
              <Badge className={`status-badge ${getStatusColor(claim.status)}`}>
                {claim.status}
              </Badge>
            </div>
            <div>
              <p className="text-caption">Leverandør</p>
              <p className="text-body font-medium">{claim.suppliers?.name || 'Ingen'}</p>
              <p className="text-body-small text-muted-foreground">Tekniker: {claim.technician?.name || 'Ingen'}</p>
            </div>
            <div className="flex justify-end">
              <Link to={`/claim/${claim.id}`}>
                <Button variant="outline" className="btn-icon-sm">
                  <Eye />
                  Se
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
