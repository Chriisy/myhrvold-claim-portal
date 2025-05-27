
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
      <div className="mobile-spacing lg:desktop-spacing">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="animate-pulse border rounded-lg mobile-padding lg:desktop-padding">
            <div className="grid grid-cols-1 lg:grid-cols-6 mobile-grid-gap lg:desktop-grid-gap">
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
      <div className="text-center py-8 lg:py-12">
        <FileX className="w-12 h-12 mx-auto mb-4 text-red-300" strokeWidth={2} />
        <p className="text-body text-red-600">Feil ved lasting av reklamasjoner.</p>
        <p className="text-body-small text-muted-foreground mt-2">Prøv å laste siden på nytt.</p>
      </div>
    );
  }

  if (claims.length === 0) {
    if (!hasAnyClaims) {
      return (
        <div className="text-center py-8 lg:py-12">
          <FileX className="w-12 h-12 mx-auto mb-4 text-gray-300" strokeWidth={2} />
          <p className="text-body text-muted-foreground mb-4">Ingen reklamasjoner er opprettet ennå.</p>
          <Link to="/claim/new">
            <Button className="btn-icon-md">
              <Plus strokeWidth={2} />
              Opprett første reklamasjon
            </Button>
          </Link>
        </div>
      );
    }

    return (
      <div className="text-center py-8 lg:py-12">
        <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" strokeWidth={2} />
        <p className="text-body text-muted-foreground">Ingen reklamasjoner funnet med gjeldende filtre.</p>
        <p className="text-body-small text-muted-foreground mt-2">Prøv å endre søkekriteriene eller gå til neste side.</p>
      </div>
    );
  }

  return (
    <div className="mobile-spacing lg:desktop-spacing">
      {claims.map((claim) => (
        <div key={claim.id} className="border rounded-lg mobile-padding lg:desktop-padding hover:bg-gray-50 transition-colors">
          <div className="grid grid-cols-1 lg:grid-cols-6 mobile-grid-gap lg:desktop-grid-gap items-start lg:items-center">
            <div>
              <p className="text-body-large font-semibold text-myhrvold-primary">{claim.id}</p>
              <p className="text-body-small text-muted-foreground">
                {new Date(claim.created_at).toLocaleDateString('nb-NO')}
              </p>
            </div>
            <div>
              <p className="text-body font-medium">{claim.customer_name || 'Ukjent kunde'}</p>
              <p className="text-body-small text-muted-foreground">{claim.machine_model || 'Ingen maskin'}</p>
              {claim.part_number && (
                <p className="text-body-small text-blue-600 font-mono">Del: {claim.part_number}</p>
              )}
            </div>
            <div>
              <Badge className={`status-badge ${getStatusColor(claim.status || 'Ny')}`}>
                {claim.status || 'Ny'}
              </Badge>
              <p className="text-body-small text-muted-foreground mt-1">{claim.category || 'Ingen kategori'}</p>
            </div>
            <div>
              <p className="text-caption">Leverandør</p>
              <p className="text-body font-medium">{claim.suppliers?.name || 'Ingen leverandør'}</p>
            </div>
            <div>
              <p className="text-caption">Tekniker</p>
              <p className="text-body font-medium">{claim.technician?.name || 'Ingen tekniker'}</p>
            </div>
            <div className="flex items-center justify-between lg:justify-end">
              <div className="lg:hidden">
                <p className="text-caption">Opprettet</p>
                <p className="text-body font-semibold">{claim.created_by || 'Ukjent'}</p>
              </div>
              <div className="hidden lg:block text-right mr-3">
                <p className="text-caption">Opprettet</p>
                <p className="text-body font-semibold">{claim.created_by || 'Ukjent'}</p>
              </div>
              <Link to={`/claim/${claim.id}`}>
                <Button variant="outline" className="btn-icon-sm lg:btn-icon-md">
                  <Eye strokeWidth={2} />
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
