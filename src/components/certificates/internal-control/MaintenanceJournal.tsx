
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, FileText } from 'lucide-react';
import { useCreateMaintenanceChecklist, useMaintenanceChecklists } from '@/hooks/useMaintenance';
import { toast } from '@/hooks/use-toast';

export const MaintenanceJournal = () => {
  const [newChecklistName, setNewChecklistName] = useState('');
  const [newChecklistLocation, setNewChecklistLocation] = useState('');
  const { data: checklists = [], isLoading } = useMaintenanceChecklists();
  const createChecklistMutation = useCreateMaintenanceChecklist();

  const handleCreateChecklist = async () => {
    if (!newChecklistName.trim()) {
      toast({
        title: "Navn mangler",
        description: "Du må oppgi et navn for vedlikeholdsjournalen",
        variant: "destructive",
      });
      return;
    }

    try {
      await createChecklistMutation.mutateAsync({
        name: newChecklistName.trim(),
        location: newChecklistLocation.trim() || undefined,
      });
      
      setNewChecklistName('');
      setNewChecklistLocation('');
    } catch (error) {
      console.error('Failed to create checklist:', error);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Laster vedlikeholdsjournaler...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Opprett ny vedlikeholdsjournal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="checklistName">Navn på journal</Label>
              <Input
                id="checklistName"
                value={newChecklistName}
                onChange={(e) => setNewChecklistName(e.target.value)}
                placeholder="F.eks. Vedlikehold kjølesystem"
              />
            </div>
            <div>
              <Label htmlFor="checklistLocation">Lokasjon (valgfritt)</Label>
              <Input
                id="checklistLocation"
                value={newChecklistLocation}
                onChange={(e) => setNewChecklistLocation(e.target.value)}
                placeholder="F.eks. Bygning A, rom 101"
              />
            </div>
          </div>
          <Button 
            onClick={handleCreateChecklist}
            disabled={createChecklistMutation.isPending}
            className="w-full md:w-auto"
          >
            {createChecklistMutation.isPending ? 'Oppretter...' : 'Opprett journal'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Eksisterende journaler
          </CardTitle>
        </CardHeader>
        <CardContent>
          {checklists.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Ingen vedlikeholdsjournaler opprettet ennå.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {checklists.map((checklist) => (
                <Card key={checklist.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{checklist.name}</h3>
                    {checklist.location && (
                      <p className="text-sm text-gray-600 mb-3">{checklist.location}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Opprettet: {new Date(checklist.created_at).toLocaleDateString('nb-NO')}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceJournal;
