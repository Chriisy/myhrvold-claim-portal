
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, FileX, Search, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ClaimData {
  id: string;
  customer_name?: string;
  machine_model?: string;
  part_number?: string;
  status?: string;
  category?: string;
  created_at: string;
  created_by?: string;
  suppliers?: { name: string } | null;
  technician?: { name: string } | null;
}

interface ClaimsListTableProps {
  claims: ClaimData[];
  isLoading: boolean;
  error: boolean;
  hasAnyClaims: boolean;
}

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

export const ClaimsListTable = ({ claims, isLoading, error, hasAnyClaims }: ClaimsListTableProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse border rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              {[...Array(6)].map((_, j) => (
                <div key={j} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <FileX className="w-12 h-12 mx-auto mb-4 text-red-300" />
        <p className="text-red-600">Feil ved lasting av reklamasjoner.</p>
        <p className="text-sm text-gray-500 mt-2">Prøv å laste siden på nytt.</p>
      </div>
    );
  }

  if (claims.length === 0) {
    if (!hasAnyClaims) {
      return (
        <div className="text-center py-8">
          <FileX className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-4">Ingen reklamasjoner er opprettet ennå.</p>
          <Link to="/claim/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Opprett første reklamasjon
            </Button>
          </Link>
        </div>
      );
    }

    return (
      <div className="text-center py-8">
        <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500">Ingen reklamasjoner funnet med gjeldende filtre.</p>
        <p className="text-sm text-gray-400 mt-2">Prøv å endre søkekriteriene.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="space-y-3">
        {claims.map((claim) => (
          <div key={claim.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
              <div>
                <p className="font-semibold text-myhrvold-primary">{claim.id}</p>
                <p className="text-sm text-gray-600">
                  {new Date(claim.created_at).toLocaleDateString('nb-NO')}
                </p>
              </div>
              <div>
                <p className="font-medium">{claim.customer_name || 'Ukjent kunde'}</p>
                <p className="text-sm text-gray-600">{claim.machine_model || 'Ingen maskin'}</p>
                {claim.part_number && (
                  <p className="text-xs text-blue-600 font-mono">Del: {claim.part_number}</p>
                )}
              </div>
              <div>
                <Badge className={getStatusColor(claim.status || 'Ny')}>
                  {claim.status || 'Ny'}
                </Badge>
                <p className="text-sm text-gray-600 mt-1">{claim.category || 'Ingen kategori'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Leverandør</p>
                <p className="font-medium">{claim.suppliers?.name || 'Ingen leverandør'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tekniker</p>
                <p className="font-medium">{claim.technician?.name || 'Ingen tekniker'}</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Opprettet</p>
                  <p className="font-semibold">{claim.created_by || 'Ukjent'}</p>
                </div>
                <Link to={`/claim/${claim.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Se
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
