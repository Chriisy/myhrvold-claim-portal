import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUsers } from '@/hooks/useUsers';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface Certificate {
  id: string;
  certificate_type: 'personal' | 'company';
  certificate_number: string;
  holder_name?: string;
  holder_user_id?: string;
  issue_date: string;
  expiry_date: string;
  issuing_authority?: string;
  notes?: string;
  category?: string;
  birth_date?: string;
  issued_date?: string;
}

interface EditCertificateModalProps {
  open: boolean;
  onClose: () => void;
  certificate: Certificate | null;
}

export const EditCertificateModal = ({ open, onClose, certificate }: EditCertificateModalProps) => {
  const [formData, setFormData] = useState({
    certificate_type: 'personal' as 'personal' | 'company',
    certificate_number: '',
    holder_name: '',
    holder_user_id: '',
    issue_date: '',
    expiry_date: '',
    issuing_authority: '',
    notes: '',
    category: 'I',
    birth_date: '',
    issued_date: ''
  });

  const { data: users } = useUsers();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (certificate) {
      setFormData({
        certificate_type: certificate.certificate_type,
        certificate_number: certificate.certificate_number,
        holder_name: certificate.holder_name || '',
        holder_user_id: certificate.holder_user_id || '',
        issue_date: certificate.issue_date ? certificate.issue_date.split('T')[0] : '',
        expiry_date: certificate.expiry_date ? certificate.expiry_date.split('T')[0] : '',
        issuing_authority: certificate.issuing_authority || '',
        notes: certificate.notes || '',
        category: certificate.category || 'I',
        birth_date: certificate.birth_date ? certificate.birth_date.split('T')[0] : '',
        issued_date: certificate.issued_date ? certificate.issued_date.split('T')[0] : ''
      });
    }
  }, [certificate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!certificate) return;

    try {
      const updateData = {
        ...formData,
        holder_user_id: formData.holder_user_id || null,
        birth_date: formData.birth_date || null,
        issued_date: formData.issued_date || null
      };

      const { error } = await supabase
        .from('f_gas_certificates')
        .update(updateData)
        .eq('id', certificate.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['f-gas-certificates'] });
      queryClient.invalidateQueries({ queryKey: ['f-gas-certificate-stats'] });

      toast({
        title: 'Sertifikat oppdatert',
        description: 'Sertifikatet har blitt oppdatert.',
      });
      onClose();
    } catch (error) {
      console.error('Error updating certificate:', error);
      toast({
        title: 'Feil ved oppdatering',
        description: 'Kunne ikke oppdatere sertifikat. Prøv igjen.',
        variant: 'destructive',
      });
    }
  };

  if (!certificate) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rediger F-gass Sertifikat</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="certificate_type">Type sertifikat</Label>
            <Select 
              value={formData.certificate_type} 
              onValueChange={(value: 'personal' | 'company') => 
                setFormData({...formData, certificate_type: value})
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">Personlig</SelectItem>
                <SelectItem value="company">Bedrift</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="category">Kategori</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData({...formData, category: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="I">Kategori I</SelectItem>
                <SelectItem value="II">Kategori II</SelectItem>
                <SelectItem value="III">Kategori III</SelectItem>
                <SelectItem value="IV">Kategori IV</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="certificate_number">Sertifikatnummer</Label>
            <Input
              id="certificate_number"
              value={formData.certificate_number}
              onChange={(e) => setFormData({...formData, certificate_number: e.target.value})}
              required
            />
          </div>

          {formData.certificate_type === 'personal' && (
            <>
              <div>
                <Label htmlFor="holder_name">Innehaver navn</Label>
                <Input
                  id="holder_name"
                  value={formData.holder_name}
                  onChange={(e) => setFormData({...formData, holder_name: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="birth_date">Fødselsdato</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="holder_user_id">Koble til bruker (valgfritt)</Label>
                <Select 
                  value={formData.holder_user_id || undefined} 
                  onValueChange={(value) => setFormData({...formData, holder_user_id: value || ''})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Velg bruker..." />
                  </SelectTrigger>
                  <SelectContent>
                    {users?.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="issue_date">Utstedelsesdato</Label>
              <Input
                id="issue_date"
                type="date"
                value={formData.issue_date}
                onChange={(e) => setFormData({...formData, issue_date: e.target.value})}
                required
              />
            </div>

            <div>
              <Label htmlFor="expiry_date">Utløpsdato</Label>
              <Input
                id="expiry_date"
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="issued_date">Utstedt dato</Label>
            <Input
              id="issued_date"
              type="date"
              value={formData.issued_date}
              onChange={(e) => setFormData({...formData, issued_date: e.target.value})}
            />
          </div>

          <div>
            <Label htmlFor="issuing_authority">Utstedende myndighet</Label>
            <Input
              id="issuing_authority"
              value={formData.issuing_authority}
              onChange={(e) => setFormData({...formData, issuing_authority: e.target.value})}
              placeholder="F.eks. Direktoratet for byggkvalitet"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notater</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Eventuelle notater eller kommentarer..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Avbryt
            </Button>
            <Button type="submit">
              Oppdater sertifikat
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
