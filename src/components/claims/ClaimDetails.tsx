
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useClaimQuery } from '@/hooks/queries/useClaimsQuery';

export function ClaimDetails() {
  const { id } = useParams<{ id: string }>();
  
  const { data: claim, isLoading, error } = useClaimQuery(id || '');

  if (!id) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Reklamasjon ikke funnet</h1>
        <p className="text-gray-600">Ugyldig reklamasjons-ID</p>
        <Link to="/claims">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tilbake til reklamasjoner
          </Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !claim) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-red-600">Feil ved lasting av reklamasjon</h1>
        <p className="text-gray-600 mb-4">
          Kunne ikke laste reklamasjon med ID: {id}
        </p>
        <Link to="/claims">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tilbake til reklamasjoner
          </Button>
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ny': return 'bg-blue-100 text-blue-800';
      case 'Under behandling': return 'bg-yellow-100 text-yellow-800';
      case 'Godkjent': return 'bg-green-100 text-green-800';
      case 'Avslått': return 'bg-red-100 text-red-800';
      case 'Lukket': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/claims">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tilbake
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              Reklamasjon {claim.display_id || claim.id.slice(0, 8)}
            </h1>
            <p className="text-gray-600">
              {claim.customer_name} - {claim.machine_model}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(claim.status)}>
            {claim.status}
          </Badge>
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Rediger
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Grunnleggende informasjon</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Kunde</label>
              <p className="font-medium">{claim.customer_name || 'Ikke oppgitt'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Kundenummer</label>
              <p>{claim.customer_no || 'Ikke oppgitt'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Maskinmodell</label>
              <p>{claim.machine_model || 'Ikke oppgitt'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Serienummer</label>
              <p>{claim.machine_serial || 'Ikke oppgitt'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Antall</label>
              <p>{claim.quantity || 'Ikke oppgitt'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Varenummer</label>
              <p>{claim.part_number || 'Ikke oppgitt'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Garanti</label>
              <p>{claim.warranty ? 'Ja' : 'Nei'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Beskrivelse</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">
              {claim.description || 'Ingen beskrivelse oppgitt'}
            </p>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle>Kundeinformasjon</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Adresse</label>
              <p>{claim.customer_address || 'Ikke oppgitt'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">By</label>
              <p>{claim.customer_city || 'Ikke oppgitt'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Postnummer</label>
              <p>{claim.customer_postal_code || 'Ikke oppgitt'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Rapportert av</label>
              <p>{claim.reported_by || 'Ikke oppgitt'}</p>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle>Systeminformasjon</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Opprettet</label>
              <p>{new Date(claim.created_at).toLocaleDateString('no-NO')}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Kategori</label>
              <p>{claim.category || 'Ikke kategorisert'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Avdeling</label>
              <p>{claim.department || 'Ikke oppgitt'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Visma ordrenummer</label>
              <p>{claim.visma_order_no || 'Ikke oppgitt'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Kunde PO</label>
              <p>{claim.customer_po || 'Ikke oppgitt'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Internal Notes */}
      {claim.internal_note && (
        <Card>
          <CardHeader>
            <CardTitle>Interne notater</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-gray-600">
              {claim.internal_note}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Analysis Section */}
      {(claim.root_cause || claim.corrective_action || claim.preventive_action) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {claim.root_cause && (
            <Card>
              <CardHeader>
                <CardTitle>Rotårsak</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">
                  {claim.root_cause}
                </p>
              </CardContent>
            </Card>
          )}

          {claim.corrective_action && (
            <Card>
              <CardHeader>
                <CardTitle>Korrigerende tiltak</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">
                  {claim.corrective_action}
                </p>
              </CardContent>
            </Card>
          )}

          {claim.preventive_action && (
            <Card>
              <CardHeader>
                <CardTitle>Forebyggende tiltak</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">
                  {claim.preventive_action}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
