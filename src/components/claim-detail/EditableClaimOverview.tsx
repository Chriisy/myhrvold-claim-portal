import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, X } from 'lucide-react';
import { useEditClaim } from '@/hooks/useEditClaim';
import { usePermissions } from '@/hooks/usePermissions';
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
  department?: string;
  machine_model?: string;
  machine_serial?: string;
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
  suppliers?: { name: string } | null;
  technician?: { name: string } | null;
  salesperson?: { name: string } | null;
  created_by?: string;
}

interface EditableClaimOverviewProps {
  claim: ClaimData;
}

// Category and status options remain here as they're specific to claim business logic
const categoryOptions = [
  { value: 'Service', label: 'Service' },
  { value: 'Installasjon', label: 'Installasjon' },
  { value: 'Produkt', label: 'Produkt' },
  { value: 'Del', label: 'Del' },
];

const statusOptions = [
  { value: 'Ny', label: 'Ny' },
  { value: 'Avventer', label: 'Avventer' },
  { value: 'Godkjent', label: 'Godkjent' },
  { value: 'Avslått', label: 'Avslått' },
  { value: 'Bokført', label: 'Bokført' },
  { value: 'Lukket', label: 'Lukket' },
];

// Helper function to validate and normalize status
const getValidStatus = (status?: ClaimStatus | string): ClaimStatus => {
  const validStatuses: ClaimStatus[] = ['Ny', 'Avventer', 'Godkjent', 'Avslått', 'Bokført', 'Lukket'];
  
  if (status && validStatuses.includes(status as ClaimStatus)) {
    return status as ClaimStatus;
  }
  
  console.log('Invalid status detected, defaulting to "Ny":', status);
  return 'Ny';
};

export function EditableClaimOverview({ claim }: EditableClaimOverviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  // Normalize the status before setting it in state
  const normalizedClaim = {
    ...claim,
    status: getValidStatus(claim.status)
  };
  
  const [formData, setFormData] = useState(normalizedClaim);
  const editClaim = useEditClaim();
  const { canEditAllClaims, canEditOwnClaims, user } = usePermissions();

  // Check if user can edit this claim
  const canEdit = canEditAllClaims() || (canEditOwnClaims() && claim.created_by === user?.id);

  const handleSave = async () => {
    // Only send the database columns, not the joined relationship data
    // Filter out undefined/null values and ensure valid enum values
    const updateData = {
      id: formData.id,
      customer_name: formData.customer_name,
      customer_no: formData.customer_no,
      department: formData.department,
      machine_model: formData.machine_model,
      machine_serial: formData.machine_serial,
      warranty: formData.warranty,
      quantity: formData.quantity,
      category: formData.category,
      description: formData.description,
      visma_order_no: formData.visma_order_no,
      customer_po: formData.customer_po,
      reported_by: formData.reported_by,
      internal_note: formData.internal_note,
      status: getValidStatus(formData.status), // Always ensure valid status
      account_code_id: formData.account_code_id,
    };
    
    console.log('Saving claim with data:', updateData);
    await editClaim.mutateAsync(updateData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(normalizedClaim);
    setIsEditing(false);
  };

  const displayStatus = getValidStatus(claim.status);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Reklamasjon Detaljer</CardTitle>
          {!isEditing && canEdit ? (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Rediger
            </Button>
          ) : isEditing ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Avbryt
              </Button>
              <Button onClick={handleSave} disabled={editClaim.isPending}>
                {editClaim.isPending ? 'Lagrer...' : 'Lagre'}
              </Button>
            </div>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Grunnleggende informasjon</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Status:</span> 
                  <Badge className="bg-orange-100 text-orange-800">{displayStatus}</Badge>
                </div>
                <div><span className="font-medium">Kunde:</span> {claim.customer_name || 'Ikke angitt'}</div>
                <div><span className="font-medium">Kundenummer:</span> {claim.customer_no || 'Ikke angitt'}</div>
                <div><span className="font-medium">Avdeling:</span> {getDepartmentLabel(claim.department as Department)}</div>
                <div><span className="font-medium">Maskin:</span> {claim.machine_model || 'Ikke angitt'}</div>
                <div><span className="font-medium">Serienummer:</span> {claim.machine_serial || 'Ikke angitt'}</div>
                <div><span className="font-medium">Leverandør:</span> {claim.suppliers?.name || 'Ikke angitt'}</div>
                <div><span className="font-medium">Tekniker:</span> {claim.technician?.name || 'Ikke angitt'}</div>
                <div><span className="font-medium">Selger:</span> {claim.salesperson?.name || 'Ikke angitt'}</div>
                <div><span className="font-medium">Kategori:</span> {claim.category || 'Ikke angitt'}</div>
                <div><span className="font-medium">Antall:</span> {claim.quantity || 'Ikke angitt'}</div>
              </div>

              <div className="mt-6">
                <AccountCodeSelector
                  selectedAccountCodeId={claim.account_code_id}
                  onAccountCodeChange={() => {}} // Read-only in view mode
                  isEditing={false}
                />
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Referanser</h3>
              <div className="space-y-2">
                <div><span className="font-medium">Visma ordrenr:</span> {claim.visma_order_no || 'Ikke angitt'}</div>
                <div><span className="font-medium">Kunde PO:</span> {claim.customer_po || 'Ikke angitt'}</div>
                <div><span className="font-medium">Rapportert av:</span> {claim.reported_by || 'Ikke angitt'}</div>
              </div>
            </div>
            <div className="md:col-span-2">
              <h3 className="font-semibold mb-2">Beskrivelse</h3>
              <p className="text-gray-600">{claim.description || 'Ingen beskrivelse angitt'}</p>
              {claim.internal_note && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Interne notater</h3>
                  <p className="text-gray-600">{claim.internal_note}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
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
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={getValidStatus(formData.status)} 
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
              <div>
                <Label htmlFor="quantity">Antall</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity || ''}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || undefined })}
                />
              </div>
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
              <div>
                <Label htmlFor="reported_by">Rapportert av</Label>
                <Input
                  id="reported_by"
                  value={formData.reported_by || ''}
                  onChange={(e) => setFormData({ ...formData, reported_by: e.target.value })}
                />
              </div>
            </div>
            <AccountCodeSelector
              selectedAccountCodeId={formData.account_code_id}
              onAccountCodeChange={(accountCodeId) => setFormData({ ...formData, account_code_id: accountCodeId })}
              isEditing={true}
            />

            <div>
              <Label htmlFor="description">Beskrivelse</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="internal_note">Interne notater</Label>
              <Textarea
                id="internal_note"
                value={formData.internal_note || ''}
                onChange={(e) => setFormData({ ...formData, internal_note: e.target.value })}
                rows={3}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
