
import { useState } from 'react';
import { useMaintenanceChecklists, useCreateMaintenanceChecklist } from '@/hooks/useMaintenance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Wrench, Plus, Eye } from 'lucide-react';
import { EmptyState } from '../EmptyState';
import { MaintenanceChecklistDetail } from './MaintenanceChecklistDetail';

export const MaintenanceJournal = () => {
  const { data: checklists = [], isLoading } = useMaintenanceChecklists();
  const createChecklist = useCreateMaintenanceChecklist();
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedChecklistId, setSelectedChecklistId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: ''
  });

  const handleCreateChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createChecklist.mutateAsync({
        name: formData.name,
        location: formData.location,
        created_by: '' // This will be set by RLS
      });
      setCreateOpen(false);
      setFormData({ name: '', location: '' });
    } catch (error) {
      console.error('Create failed:', error);
    }
  };

  if (selectedChecklistId) {
    return (
      <MaintenanceChecklistDetail 
        checklistId={selectedChecklistId}
        onBack={() => setSelectedChecklistId(null)}
      />
    );
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Laster vedlikeholdsjournaler...</div>;
  }

  if (checklists.length === 0) {
    return (
      <>
        <EmptyState
          title="Ingen vedlikeholdsjournaler ennå"
          description="Opprett din første vedlikeholdsjournal for utstyrskontroll."
          actionLabel="Opprett vedlikeholdsjournal"
          onAction={() => setCreateOpen(true)}
        />
        
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ny vedlikeholdsjournal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateChecklist} className="space-y-4">
              <div>
                <Label htmlFor="name">Navn</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="f.eks. Trondheim - Vedlikeholdsjournal"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="location">Lokasjon</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="f.eks. Trondheim avdeling"
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                  Avbryt
                </Button>
                <Button type="submit" disabled={createChecklist.isPending}>
                  {createChecklist.isPending ? 'Oppretter...' : 'Opprett'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Wrench className="w-5 h-5" />
          Vedlikeholdsjournaler
        </CardTitle>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Ny journal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ny vedlikeholdsjournal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateChecklist} className="space-y-4">
              <div>
                <Label htmlFor="name">Navn</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="f.eks. Trondheim - Vedlikeholdsjournal"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="location">Lokasjon</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="f.eks. Trondheim avdeling"
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                  Avbryt
                </Button>
                <Button type="submit" disabled={createChecklist.isPending}>
                  {createChecklist.isPending ? 'Oppretter...' : 'Opprett'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Navn</TableHead>
              <TableHead>Lokasjon</TableHead>
              <TableHead>Opprettet</TableHead>
              <TableHead>Handlinger</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {checklists.map((checklist) => (
              <TableRow key={checklist.id}>
                <TableCell className="font-medium">{checklist.name}</TableCell>
                <TableCell>{checklist.location}</TableCell>
                <TableCell>
                  {new Date(checklist.created_at).toLocaleDateString('nb-NO')}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedChecklistId(checklist.id)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Vis
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default MaintenanceJournal;
