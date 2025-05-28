
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateFGasCertificate } from '@/hooks/useFGasCertificates';
import { useUsers } from '@/hooks/useUsers';
import { toast } from '@/hooks/use-toast';

interface AddCertificateModalProps {
  open: boolean;
  onClose: () => void;
}

export const AddCertificateModal = ({ open, onClose }: AddCertificateModalProps) => {
  const [formData, setFormData] = useState({
    certificate_type: 'personal' as 'personal' | 'company',
    certificate_number: '',
    holder_name: '',
    holder_user_id: '',
    issue_date: '',
    expiry_date: '',
    issuing_authority: '',
    notes: ''
  });

  const { data: users } = useUsers();
  const createCertificate = useCreateFGasCertificate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      holder_user_id: formData.holder_user_id || null,
      issue_date: new Date(formData.issue_date).toISOString(),
      expiry_date: new Date(formData.expiry_date).toISOString()
    };

    createCertificate.mutate(submitData, {
      onSuccess: () => {
        toast({
          title: 'Sertifikat opprettet',
          description: 'Det nye sertifikatet har blitt lagt til.',
        });
        onClose();
      },
      onError: (error) => {
        toast({
          title: 'Feil ved opprettelse',
          description: 'Kunne ikke opprette sertifikat. Prøv igjen.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nytt F-gass Sertifikat</DialogTitle>
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
                <Label htmlFor="holder_user_id">Koble til bruker (valgfritt)</Label>
                <Select 
                  value={formData.holder_user_id} 
                  onValueChange={(value) => setFormData({...formData, holder_user_id: value})}
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
            <Button type="submit" disabled={createCertificate.isPending}>
              {createCertificate.isPending ? 'Oppretter...' : 'Opprett sertifikat'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
