
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
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse border rounded-lg p-3">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
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
        <p className="text-red-600">Feil ved lasting av nylige reklamasjoner</p>
      </div>
    );
  }

  if (!claims || claims.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Ingen nylige reklamasjoner funnet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {claims.map((claim) => (
        <div key={claim.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
            <div>
              <p className="font-semibold text-myhrvold-primary text-sm">
                {claim.display_id || claim.id.slice(0, 8) + '...'}
              </p>
              <p className="text-xs text-gray-600">{new Date(claim.created_at).toLocaleDateString('nb-NO')}</p>
            </div>
            <div>
              <p className="font-medium text-sm">{claim.customer_name || 'Ukjent kunde'}</p>
              <p className="text-xs text-gray-600">{claim.machine_model || 'Ingen maskin'}</p>
              {claim.part_number && (
                <p className="text-xs text-blue-600 font-mono">Del: {claim.part_number}</p>
              )}
            </div>
            <div>
              <Badge className={`${getStatusColor(claim.status)} text-xs`}>
                {claim.status}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-gray-600">Leverandør</p>
              <p className="font-medium text-sm">{claim.suppliers?.name || 'Ingen'}</p>
              <p className="text-xs text-gray-600">Tekniker: {claim.technician?.name || 'Ingen'}</p>
            </div>
            <div className="flex justify-end">
              <Link to={`/claims/${claim.id}`}>
                <Button variant="outline" size="sm">
                  <Eye className="w-3 h-3 mr-1" />
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
