
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated: () => void;
}

export const CreateProjectDialog = ({ open, onOpenChange, onProjectCreated }: CreateProjectDialogProps) => {
  const [formData, setFormData] = useState({
    project_name: '',
    customer_name: '',
    location: '',
    assigned_technician_id: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: technicians } = useQuery({
    queryKey: ['technicians'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, name')
        .in('user_role', ['tekniker', 'admin'])
        .order('name');

      if (error) throw error;
      return data;
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Ikke innlogget');

      const projectData = {
        project_name: formData.project_name,
        customer_name: formData.customer_name || null,
        location: formData.location || null,
        assigned_technician_id: formData.assigned_technician_id || null,
        notes: formData.notes || null,
        created_by: user.user.id,
        status: 'Ny' as const
      };

      const { error } = await supabase
        .from('installation_projects')
        .insert(projectData);

      if (error) throw error;

      toast({
        title: "Prosjekt opprettet",
        description: `Installasjonprosjekt "${formData.project_name}" er opprettet`,
      });

      setFormData({
        project_name: '',
        customer_name: '',
        location: '',
        assigned_technician_id: '',
        notes: ''
      });
      onOpenChange(false);
      onProjectCreated();
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Feil",
        description: "Kunne ikke opprette prosjekt",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Opprett Nytt Installasjonprosjekt</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="project_name">Prosjektnavn *</Label>
            <Input
              id="project_name"
              value={formData.project_name}
              onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
              placeholder="F.eks. Storkjøkken Restaurant Oslo"
              required
            />
          </div>

          <div>
            <Label htmlFor="customer_name">Kunde</Label>
            <Input
              id="customer_name"
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              placeholder="Kundenavn"
            />
          </div>

          <div>
            <Label htmlFor="location">Lokasjon</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Adresse eller sted"
            />
          </div>

          <div>
            <Label htmlFor="assigned_technician">Tildelt Montør</Label>
            <Select value={formData.assigned_technician_id} onValueChange={(value) => setFormData({ ...formData, assigned_technician_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Velg montør" />
              </SelectTrigger>
              <SelectContent>
                {technicians?.map((tech) => (
                  <SelectItem key={tech.id} value={tech.id}>
                    {tech.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Notater</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Tilleggsinfo om prosjektet..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Avbryt
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.project_name}>
              {isSubmitting ? 'Oppretter...' : 'Opprett Prosjekt'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
