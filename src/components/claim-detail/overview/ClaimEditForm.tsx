
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { X, User, Settings, Building, FileText } from 'lucide-react';
import { AccountCodeSelector } from '../AccountCodeSelector';
import { Database } from '@/integrations/supabase/types';
import { departmentOptions } from '@/lib/constants/departments';

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
}

interface ClaimEditFormProps {
  claim: ClaimData;
  onSave: (data: ClaimData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  technicians?: Array<{ id: string; name: string; seller_no?: number }>;
  selgere?: Array<{ id: string; name: string; seller_no?: number }>;
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

export function ClaimEditForm({ claim, onSave, onCancel, isLoading, technicians, selgere }: ClaimEditFormProps) {
  const [formData, setFormData] = useState(claim);

  const handleSubmit = async () => {
    await onSave(formData);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Rediger Reklamasjon</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Avbryt
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? 'Lagrer...' : 'Lagre'}
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
