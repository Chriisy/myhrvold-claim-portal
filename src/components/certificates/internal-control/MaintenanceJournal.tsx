
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, FileText, Edit } from 'lucide-react';
import { useCreateMaintenanceChecklist, useMaintenanceChecklists } from '@/hooks/useMaintenance';
import { MaintenanceChecklistDetail } from './MaintenanceChecklistDetail';
import { toast } from '@/hooks/use-toast';

export const MaintenanceJournal = () => {
  const [newChecklistName, setNewChecklistName] = useState('');
  const [newChecklistLocation, setNewChecklistLocation] = useState('');
  const [selectedChecklist, setSelectedChecklist] = useState<string | null>(null);
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

  if (selectedChecklist) {
    return (
      <MaintenanceChecklistDetail 
        checklistId={selectedChecklist}
        onBack={() => setSelectedChecklist(null)}
      />
    );
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Laster vedlikeholdsjournaler...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Vedlikeholdsjournal</h2>
        <p className="text-gray-600">
          Administrer vedlikeholdsjournaler for utstyr. Hver journal følger en Excel-lignende struktur 
          med utstyr i rader og kontrollpunkter i kolonner.
        </p>
      </div>

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
                placeholder="F.eks. Trondheim - Vedlikeholdsjournal 2024"
              />
            </div>
            <div>
              <Label htmlFor="checklistLocation">Lokasjon (valgfritt)</Label>
              <Input
                id="checklistLocation"
                value={newChecklistLocation}
                onChange={(e) => setNewChecklistLocation(e.target.value)}
                placeholder="F.eks. Trondheim avdeling"
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
            Eksisterende journaler ({checklists.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {checklists.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Ingen vedlikeholdsjournaler ennå
              </h3>
              <p className="text-gray-500 mb-6">
                Opprett din første vedlikeholdsjournal for å komme i gang med systematisk 
                vedlikehold av utstyr.
              </p>
              <Button 
                onClick={() => setNewChecklistName('Ny vedlikeholdsjournal')}
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Opprett første journal
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {checklists.map((checklist) => (
                <Card key={checklist.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-lg leading-tight">{checklist.name}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedChecklist(checklist.id)}
                        className="h-8 w-8 p-0 shrink-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {checklist.location && (
                      <p className="text-sm text-gray-600 mb-3">{checklist.location}</p>
                    )}
                    
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500">
                        Opprettet: {new Date(checklist.created_at).toLocaleDateString('nb-NO')}
                      </p>
                      <Button
                        onClick={() => setSelectedChecklist(checklist.id)}
                        className="w-full"
                        size="sm"
                      >
                        Åpne journal
                      </Button>
                    </div>
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
