
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, FileX, Search, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ClaimData {
  id: string;
  display_id?: string;
  customer_name?: string;
  machine_model?: string;
  part_number?: string;
  status?: string;
  category?: string | null;
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
        {[...Array(10)].map((_, i) => (
          <div key={i} className="animate-pulse border rounded-lg p-4">
            <div className="flex flex-col space-y-3">
              <div className="flex justify-between items-start">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
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
          <Link to="/new-claim">
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
        <p className="text-sm text-gray-400 mt-2">Prøv å endre søkekriteriene eller gå til neste side.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="space-y-3">
        {claims.map((claim) => (
          <div key={claim.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors w-full">
            {/* Header with ID, Status and Action Button */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <p className="font-semibold text-myhrvold-primary text-sm">
                  {claim.display_id || claim.id}
                </p>
                <Badge className={`${getStatusColor(claim.status || 'Ny')} text-xs w-fit`}>
                  {claim.status || 'Ny'}
                </Badge>
              </div>
              <Link to={`/claims/${claim.id}`}>
                <Button variant="outline" size="sm" className="shrink-0">
                  <Eye className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Se</span>
                </Button>
              </Link>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              {/* Customer Info */}
              <div className="space-y-1">
                <p className="text-gray-600 font-medium">Kunde</p>
                <p className="font-medium break-words">{claim.customer_name || 'Ukjent kunde'}</p>
                <p className="text-gray-600 text-xs break-words">{claim.machine_model || 'Ingen maskin'}</p>
                {claim.part_number && (
                  <p className="text-blue-600 font-mono text-xs break-all">Del: {claim.part_number}</p>
                )}
              </div>

              {/* Supplier/Category Info */}
              <div className="space-y-1">
                <p className="text-gray-600 font-medium">Leverandør</p>
                <p className="font-medium break-words">{claim.suppliers?.name || 'Ingen leverandør'}</p>
                <p className="text-gray-600 text-xs">{claim.category || 'Ingen kategori'}</p>
              </div>

              {/* Date/Technician Info */}
              <div className="space-y-1">
                <p className="text-gray-600 font-medium">Detaljer</p>
                <p className="text-xs text-gray-600">
                  Opprettet: {new Date(claim.created_at).toLocaleDateString('nb-NO')}
                </p>
                <p className="text-xs">
                  <span className="text-gray-600">Tekniker: </span>
                  <span className="font-medium">{claim.technician?.name || 'Ingen tekniker'}</span>
                </p>
                <p className="text-xs">
                  <span className="text-gray-600">Av: </span>
                  <span className="font-medium">{claim.created_by || 'Ukjent'}</span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
