
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

interface ClaimData {
  id: string;
  customer_name?: string;
  customer_no?: string;
  department?: string;
  machine_model?: string;
  machine_serial?: string;
  warranty?: boolean;
  quantity?: number;
  category?: string;
  description?: string;
  visma_order_no?: string;
  customer_po?: string;
  reported_by?: string;
  internal_note?: string;
  status?: string;
}

interface EditableClaimOverviewProps {
  claim: ClaimData;
}

export function EditableClaimOverview({ claim }: EditableClaimOverviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(claim);
  const editClaim = useEditClaim();

  const handleSave = async () => {
    await editClaim.mutateAsync(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(claim);
    setIsEditing(false);
  };

  const statusOptions = [
    { value: 'Ny', label: 'Ny' },
    { value: 'Under behandling', label: 'Under behandling' },
    { value: 'Venter på deler', label: 'Venter på deler' },
    { value: 'Lukket', label: 'Lukket' },
  ];

  const categoryOptions = [
    { value: 'ServiceJobb', label: 'ServiceJobb' },
    { value: 'Installasjon', label: 'Installasjon' },
    { value: 'Montasje', label: 'Montasje' },
    { value: 'Produkt', label: 'Produkt' },
    { value: 'Del', label: 'Del' },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Reklamasjon Detaljer</CardTitle>
          {!isEditing ? (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Rediger
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Avbryt
              </Button>
              <Button onClick={handleSave} disabled={editClaim.isPending}>
                {editClaim.isPending ? 'Lagrer...' : 'Lagre'}
              </Button>
            </div>
          )}
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
                  <Badge className="bg-orange-100 text-orange-800">{claim.status || 'Ny'}</Badge>
                </div>
                <div><span className="font-medium">Kunde:</span> {claim.customer_name || 'Ikke angitt'}</div>
                <div><span className="font-medium">Kundenummer:</span> {claim.customer_no || 'Ikke angitt'}</div>
                <div><span className="font-medium">Avdeling:</span> {claim.department || 'Ikke angitt'}</div>
                <div><span className="font-medium">Maskin:</span> {claim.machine_model || 'Ikke angitt'}</div>
                <div><span className="font-medium">Serienummer:</span> {claim.machine_serial || 'Ikke angitt'}</div>
                <div><span className="font-medium">Kategori:</span> {claim.category || 'Ikke angitt'}</div>
                <div><span className="font-medium">Antall:</span> {claim.quantity || 'Ikke angitt'}</div>
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
                <Input
                  id="department"
                  value={formData.department || ''}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
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
                <Select value={formData.category || ''} onValueChange={(value) => setFormData({ ...formData, category: value })}>
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
                <Select value={formData.status || ''} onValueChange={(value) => setFormData({ ...formData, status: value })}>
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
