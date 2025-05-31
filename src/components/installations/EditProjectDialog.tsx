
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ProjectStatusSelector } from './ProjectStatusSelector';

interface EditProjectDialogProps {
  project: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export const EditProjectDialog = ({ project, open, onOpenChange, onUpdate }: EditProjectDialogProps) => {
  const [formData, setFormData] = useState({
    project_name: project?.project_name || '',
    customer_name: project?.customer_name || '',
    location: project?.location || '',
    msnr: project?.msnr || '',
    address: project?.address || '',
    status: project?.status || 'Ny',
    notes: project?.notes || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('installation_projects')
        .update(formData)
        .eq('id', project.id);

      if (error) throw error;

      toast({
        title: "Prosjekt oppdatert",
        description: "Endringene er lagret",
      });

      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Feil",
        description: "Kunne ikke oppdatere prosjekt",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rediger prosjekt</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="project_name">Prosjektnavn *</Label>
            <Input
              id="project_name"
              value={formData.project_name}
              onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="customer_name">Kundenavn</Label>
            <Input
              id="customer_name"
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="msnr">MSNR</Label>
            <Input
              id="msnr"
              value={formData.msnr}
              onChange={(e) => setFormData({ ...formData, msnr: e.target.value })}
              placeholder="Maskin serienummer"
            />
          </div>

          <div>
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Installasjonsadresse"
            />
          </div>

          <div>
            <Label htmlFor="location">Lokasjon</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div>
            <ProjectStatusSelector
              currentStatus={formData.status}
              onStatusChange={(status) => setFormData({ ...formData, status })}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notater</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Avbryt
            </Button>
            <Button type="submit" className="flex-1">
              Lagre endringer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
