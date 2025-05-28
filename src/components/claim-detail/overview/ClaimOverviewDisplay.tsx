
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Edit, User, Building, FileText, Settings } from 'lucide-react';
import { AccountCodeSelector } from '../AccountCodeSelector';
import { Database } from '@/integrations/supabase/types';
import { getDepartmentLabel } from '@/lib/constants/departments';

type Department = Database['public']['Enums']['department'];

interface ClaimData {
  id: string;
  customer_name?: string;
  customer_no?: string;
  customer_address?: string;
  customer_postal_code?: string;
  customer_city?: string;
  department?: string;
  machine_model?: string;
  machine_serial?: string;
  part_number?: string;
  warranty?: boolean;
  quantity?: number;
  category?: string;
  description?: string;
  visma_order_no?: string;
  customer_po?: string;
  reported_by?: string;
  internal_note?: string;
  status?: string;
  account_code_id?: number;
  suppliers?: { name: string } | null;
  technician?: { name: string } | null;
  salesperson?: { name: string } | null;
}

interface ClaimOverviewDisplayProps {
  claim: ClaimData;
  canEdit: boolean;
  onEdit: () => void;
}

export function ClaimOverviewDisplay({ claim, canEdit, onEdit }: ClaimOverviewDisplayProps) {
  const formatAddress = () => {
    const parts = [];
    if (claim.customer_address) parts.push(claim.customer_address);
    if (claim.customer_postal_code || claim.customer_city) {
      const cityLine = [claim.customer_postal_code, claim.customer_city].filter(Boolean).join(' ');
      if (cityLine) parts.push(cityLine);
    }
    return parts.length > 0 ? parts : ['Ikke angitt'];
  };

  return (
    <div className="space-y-6">
      {/* Status and Actions Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-orange-100 text-orange-800 px-3 py-1">
                {claim.status || 'Ny'}
              </Badge>
              <span className="text-sm text-gray-500">Reklamasjon ID: {claim.id}</span>
            </div>
            {canEdit && (
              <Button variant="outline" onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Rediger
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5 text-blue-600" />
              Kundeinformasjon
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Kunde:</span>
                <p className="mt-1">{claim.customer_name || 'Ikke angitt'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Kundenummer:</span>
                <p className="mt-1">{claim.customer_no || 'Ikke angitt'}</p>
              </div>
              <div className="col-span-2">
                <span className="font-medium text-gray-600">Adresse:</span>
                <div className="mt-1 space-y-1">
                  {formatAddress().map((line, index) => (
                    <p key={index} className={line === 'Ikke angitt' ? 'text-gray-500' : ''}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
              <div className="col-span-2">
                <span className="font-medium text-gray-600">Avdeling:</span>
                <p className="mt-1">{getDepartmentLabel(claim.department as Department)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Equipment Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="w-5 h-5 text-green-600" />
              Utstyrsinformasjon
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Maskin:</span>
                <p className="mt-1">{claim.machine_model || 'Ikke angitt'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Serienummer:</span>
                <p className="mt-1">{claim.machine_serial || 'Ikke angitt'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Delenummer:</span>
                <p className="mt-1">{claim.part_number || 'Ikke angitt'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Kategori:</span>
                <p className="mt-1">{claim.category || 'Ikke angitt'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Antall:</span>
                <p className="mt-1">{claim.quantity || 'Ikke angitt'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building className="w-5 h-5 text-purple-600" />
              Team & Leverandører
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-600">Leverandør:</span>
                <p className="mt-1">{claim.suppliers?.name || 'Ikke angitt'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Tekniker:</span>
                <p className="mt-1">{claim.technician?.name || 'Ikke angitt'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Selger:</span>
                <p className="mt-1">{claim.salesperson?.name || 'Ikke angitt'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reference Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5 text-orange-600" />
              Referanser
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-600">Visma ordrenr:</span>
                <p className="mt-1">{claim.visma_order_no || 'Ikke angitt'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Kunde PO:</span>
                <p className="mt-1">{claim.customer_po || 'Ikke angitt'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Rapportert av:</span>
                <p className="mt-1">{claim.reported_by || 'Ikke angitt'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Code Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Kontokode</CardTitle>
        </CardHeader>
        <CardContent>
          <AccountCodeSelector
            selectedAccountCodeId={claim.account_code_id}
            onAccountCodeChange={() => {}}
            isEditing={false}
          />
        </CardContent>
      </Card>

      {/* Description Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Beskrivelse</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {claim.description || 'Ingen beskrivelse angitt'}
          </p>
          {claim.internal_note && (
            <>
              <Separator className="my-4" />
              <div>
                <h4 className="font-semibold mb-2 text-gray-800">Interne notater</h4>
                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                  {claim.internal_note}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
