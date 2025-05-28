
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Edit, X, User, Building, FileText, Settings } from 'lucide-react';
import { useEditClaim } from '@/hooks/useEditClaim';
import { usePermissions } from '@/hooks/usePermissions';
import { useTechnicians } from '@/hooks/useTechnicians';
import { useSelgere } from '@/hooks/useSelgere';
import { AccountCodeSelector } from './AccountCodeSelector';
import { Database } from '@/integrations/supabase/types';
import { departmentOptions, getDepartmentLabel } from '@/lib/constants/departments';

type ClaimCategory = Database['public']['Enums']['claim_category'];
type ClaimStatus = Database['public']['Enums']['claim_status'];
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
  category?: ClaimCategory;
  description?: string;
  visma_order_no?: string;
  customer_po?: string;
  reported_by?: string;
  internal_note?: string;
  status?: ClaimStatus;
  account_code_id?: number;
  technician_id?: string;
  salesperson_id?: string;
  suppliers?: { name: string } | null;
  technician?: { name: string } | null;
  salesperson?: { name: string } | null;
  created_by?: string;
}

interface EditableClaimOverviewProps {
  claim: ClaimData;
}

const categoryOptions = [
  { value: 'Service', label: 'Service' },
  { value: 'Installasjon', label: 'Installasjon' },
  { value: 'Produkt', label: 'Produkt' },
  { value: 'Del', label: 'Del' },
];

const statusOptions = [
  { value: 'Ny', label: 'Ny' },
  { value: 'Avventer', label: 'Avventer' },
  { value: 'Venter på svar', label: 'Venter på svar' },
  { value: 'Godkjent', label: 'Godkjent' },
  { value: 'Avslått', label: 'Avslått' },
  { value: 'Bokført', label: 'Bokført' },
  { value: 'Lukket', label: 'Lukket' },
];

export function EditableClaimOverview({ claim }: EditableClaimOverviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(claim);
  const editClaim = useEditClaim();
  const { canEditAllClaims, canEditOwnClaims, user } = usePermissions();
  const { data: technicians } = useTechnicians();
  const { data: selgere } = useSelgere();

  const canEdit = canEditAllClaims() || (canEditOwnClaims() && claim.created_by === user?.id);

  const handleSave = async () => {
    const updateData = {
      id: formData.id,
      customer_name: formData.customer_name || null,
      customer_no: formData.customer_no || null,
      customer_address: formData.customer_address || null,
      customer_postal_code: formData.customer_postal_code || null,
      customer_city: formData.customer_city || null,
      department: formData.department || null,
      machine_model: formData.machine_model || null,
      machine_serial: formData.machine_serial || null,
      part_number: formData.part_number || null,
      warranty: formData.warranty || false,
      quantity: formData.quantity || null,
      category: formData.category || null,
      description: formData.description || null,
      visma_order_no: formData.visma_order_no || null,
      customer_po: formData.customer_po || null,
      reported_by: formData.reported_by || null,
      internal_note: formData.internal_note || null,
      status: formData.status || 'Ny',
      account_code_id: formData.account_code_id || null,
      technician_id: formData.technician_id === 'none' ? null : formData.technician_id || null,
      salesperson_id: formData.salesperson_id === 'none' ? null : formData.salesperson_id || null,
    };
    
    console.log('handleSave - Final updateData:', updateData);
    
    await editClaim.mutateAsync(updateData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(claim);
    setIsEditing(false);
  };

  const formatAddress = () => {
    const parts = [];
    if (claim.customer_address) parts.push(claim.customer_address);
    if (claim.customer_postal_code || claim.customer_city) {
      const cityLine = [claim.customer_postal_code, claim.customer_city].filter(Boolean).join(' ');
      if (cityLine) parts.push(cityLine);
    }
    return parts.length > 0 ? parts : ['Ikke angitt'];
  };

  if (!isEditing) {
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
                <Button variant="outline" onClick={() => setIsEditing(true)}>
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

  // Edit mode - keep existing edit form but with better spacing
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Rediger Reklamasjon</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Avbryt
            </Button>
            <Button onClick={handleSave} disabled={editClaim.isPending}>
              {editClaim.isPending ? 'Lagrer...' : 'Lagre'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Grunnleggende informasjon
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer_name">Kundenavn</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name || ''}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="customer_no">Kundenummer</Label>
                <Input
                  id="customer_no"
                  value={formData.customer_no || ''}
                  onChange={(e) => setFormData({ ...formData, customer_no: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="customer_address">Kundens adresse</Label>
                <Input
                  id="customer_address"
                  placeholder="Gateadresse"
                  value={formData.customer_address || ''}
                  onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="customer_postal_code">Postnummer</Label>
                <Input
                  id="customer_postal_code"
                  placeholder="0000"
                  maxLength={4}
                  value={formData.customer_postal_code || ''}
                  onChange={(e) => setFormData({ ...formData, customer_postal_code: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="customer_city">Poststed</Label>
                <Input
                  id="customer_city"
                  placeholder="Poststed"
                  value={formData.customer_city || ''}
                  onChange={(e) => setFormData({ ...formData, customer_city: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="department">Avdeling</Label>
                <Select 
                  value={formData.department || ''} 
                  onValueChange={(value: Department) => setFormData({ ...formData, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Velg avdeling" />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status || 'Ny'} 
                  onValueChange={(value: ClaimStatus) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Velg status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Equipment Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-green-600" />
              Utstyrsinformasjon
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="machine_model">Maskin</Label>
                <Input
                  id="machine_model"
                  value={formData.machine_model || ''}
                  onChange={(e) => setFormData({ ...formData, machine_model: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="machine_serial">Serienummer</Label>
                <Input
                  id="machine_serial"
                  value={formData.machine_serial || ''}
                  onChange={(e) => setFormData({ ...formData, machine_serial: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="part_number">Delenummer</Label>
                <Input
                  id="part_number"
                  value={formData.part_number || ''}
                  onChange={(e) => setFormData({ ...formData, part_number: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="category">Kategori</Label>
                <Select value={formData.category || ''} onValueChange={(value: ClaimCategory) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="quantity">Antall</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity || ''}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || undefined })}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Team Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-purple-600" />
              Team
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="technician_id">Tekniker</Label>
                <Select 
                  value={formData.technician_id || 'none'} 
                  onValueChange={(value) => setFormData({ ...formData, technician_id: value === 'none' ? null : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Velg tekniker" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ingen valgt</SelectItem>
                    {technicians?.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} {user.seller_no ? `(${user.seller_no})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="salesperson_id">Selger</Label>
                <Select 
                  value={formData.salesperson_id || 'none'} 
                  onValueChange={(value) => setFormData({ ...formData, salesperson_id: value === 'none' ? null : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Velg selger" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ingen valgt</SelectItem>
                    {selgere?.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} {user.seller_no ? `(${user.seller_no})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* References */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-600" />
              Referanser
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="visma_order_no">Visma ordrenr</Label>
                <Input
                  id="visma_order_no"
                  value={formData.visma_order_no || ''}
                  onChange={(e) => setFormData({ ...formData, visma_order_no: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="customer_po">Kunde PO</Label>
                <Input
                  id="customer_po"
                  value={formData.customer_po || ''}
                  onChange={(e) => setFormData({ ...formData, customer_po: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="reported_by">Rapportert av</Label>
                <Input
                  id="reported_by"
                  value={formData.reported_by || ''}
                  onChange={(e) => setFormData({ ...formData, reported_by: e.target.value })}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Account Code */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Kontokode</h3>
            <AccountCodeSelector
              selectedAccountCodeId={formData.account_code_id}
              onAccountCodeChange={(accountCodeId) => setFormData({ ...formData, account_code_id: accountCodeId })}
              isEditing={true}
            />
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Beskrivelse og notater</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Beskrivelse</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="resize-none"
                />
              </div>
              <div>
                <Label htmlFor="internal_note">Interne notater</Label>
                <Textarea
                  id="internal_note"
                  value={formData.internal_note || ''}
                  onChange={(e) => setFormData({ ...formData, internal_note: e.target.value })}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
