
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, AlertTriangle, Plus } from 'lucide-react';
import { useSubmitChecklist } from '@/hooks/useInternalControl';
import { ChecklistItem } from '@/services/internalControlService';

interface Checklist {
  id: string;
  type: string;
  title: string;
  items: ChecklistItem[];
}

const SAMPLE_CHECKLISTS: Checklist[] = [
  {
    id: '1',
    type: 'lekkasjekontroll',
    title: 'Lekkasjekontroll',
    items: [
      {
        id: '1-1',
        title: 'Visuell kontroll av rørføringer',
        description: 'Sjekk alle synlige rørføringer for tegn til lekkasje',
        completed: false,
        deviation: false
      },
      {
        id: '1-2',
        title: 'Kontroll av ventiler og koblinger',
        description: 'Inspiser alle ventiler og koblinger for lekkasje',
        completed: false,
        deviation: false
      },
      {
        id: '1-3',
        title: 'Måling med lekkasjetektor',
        description: 'Bruk elektronisk lekkasjedetektor på kritiske områder',
        completed: false,
        deviation: false
      },
      {
        id: '1-4',
        title: 'Kontroll av kuldemediummengde',
        description: 'Verifiser at kuldemediummengden er innenfor normale verdier',
        completed: false,
        deviation: false
      }
    ]
  },
  {
    id: '2',
    type: 'tomming_gjenvinning',
    title: 'Tømming og gjenvinning',
    items: [
      {
        id: '2-1',
        title: 'Kontroll av gjenvinningsutstyr',
        description: 'Verifiser at alt gjenvinningsutstyr fungerer korrekt',
        completed: false,
        deviation: false
      },
      {
        id: '2-2',
        title: 'Dokumentasjon av kuldemediummengde',
        description: 'Registrer mengde kuldemedium som tas ut av anlegget',
        completed: false,
        deviation: false
      },
      {
        id: '2-3',
        title: 'Merking av beholdere',
        description: 'Påse at alle beholdere er korrekt merket og datert',
        completed: false,
        deviation: false
      }
    ]
  },
  {
    id: '3',
    type: 'pafylling',
    title: 'Påfylling av kuldemedium',
    items: [
      {
        id: '3-1',
        title: 'Kontroll av kuldemediumtype',
        description: 'Verifiser at riktig type kuldemedium brukes',
        completed: false,
        deviation: false
      },
      {
        id: '3-2',
        title: 'Lekkasjekontroll før påfylling',
        description: 'Utfør lekkasjekontroll før påfylling av nytt kuldemedium',
        completed: false,
        deviation: false
      },
      {
        id: '3-3',
        title: 'Dokumentasjon av påfylt mengde',
        description: 'Registrer mengde kuldemedium som fylles på anlegget',
        completed: false,
        deviation: false
      }
    ]
  },
  {
    id: '4',
    type: 'egenkontroll',
    title: 'Egenkontroll',
    items: [
      {
        id: '4-1',
        title: 'Kontroll av loggføring',
        description: 'Verifiser at alle aktiviteter er korrekt dokumentert',
        completed: false,
        deviation: false
      },
      {
        id: '4-2',
        title: 'Sertifikatgyldighetskontroll',
        description: 'Sjekk at alle relevante sertifikater er gyldige',
        completed: false,
        deviation: false
      },
      {
        id: '4-3',
        title: 'Kompetansevurdering',
        description: 'Vurder om personale har nødvendig kompetanse',
        completed: false,
        deviation: false
      },
      {
        id: '4-4',
        title: 'Rutinekontroll av utstyr',
        description: 'Kontroller at alt utstyr er i forskriftsmessig stand',
        completed: false,
        deviation: false
      }
    ]
  }
];

export const DigitalChecklists = () => {
  const [checklists, setChecklists] = useState<Checklist[]>(SAMPLE_CHECKLISTS);
  const [activeChecklist, setActiveChecklist] = useState<string | null>(null);
  const submitMutation = useSubmitChecklist();

  const handleItemToggle = (checklistId: string, itemId: string) => {
    setChecklists(prev => prev.map(checklist => {
      if (checklist.id === checklistId) {
        return {
          ...checklist,
          items: checklist.items.map(item => {
            if (item.id === itemId) {
              return { ...item, completed: !item.completed };
            }
            return item;
          })
        };
      }
      return checklist;
    }));
  };

  const handleDeviationToggle = (checklistId: string, itemId: string) => {
    setChecklists(prev => prev.map(checklist => {
      if (checklist.id === checklistId) {
        return {
          ...checklist,
          items: checklist.items.map(item => {
            if (item.id === itemId) {
              return { ...item, deviation: !item.deviation };
            }
            return item;
          })
        };
      }
      return checklist;
    }));
  };

  const handleCommentChange = (checklistId: string, itemId: string, comment: string) => {
    setChecklists(prev => prev.map(checklist => {
      if (checklist.id === checklistId) {
        return {
          ...checklist,
          items: checklist.items.map(item => {
            if (item.id === itemId) {
              return { ...item, comment };
            }
            return item;
          })
        };
      }
      return checklist;
    }));
  };

  const handleSubmitChecklist = (checklistId: string) => {
    const checklist = checklists.find(c => c.id === checklistId);
    if (!checklist) return;

    const allCompleted = checklist.items.every(item => item.completed);
    if (!allCompleted) {
      alert('Alle punkter må være fullført før innlevering');
      return;
    }

    submitMutation.mutate({
      documentType: checklist.type,
      title: checklist.title,
      checklistItems: checklist.items
    }, {
      onSuccess: () => {
        setActiveChecklist(null);
        // Reset checklist
        setChecklists(prev => prev.map(c => {
          if (c.id === checklistId) {
            return {
              ...c,
              items: c.items.map(item => ({
                ...item,
                completed: false,
                deviation: false,
                comment: ''
              }))
            };
          }
          return c;
        }));
      }
    });
  };

  const getChecklistProgress = (checklist: Checklist) => {
    const completed = checklist.items.filter(item => item.completed).length;
    return `${completed}/${checklist.items.length}`;
  };

  const getChecklistStatus = (checklist: Checklist) => {
    const allCompleted = checklist.items.every(item => item.completed);
    const hasDeviations = checklist.items.some(item => item.deviation);
    
    if (hasDeviations) return { status: 'deviation', color: 'bg-red-100 text-red-800' };
    if (allCompleted) return { status: 'completed', color: 'bg-green-100 text-green-800' };
    return { status: 'in_progress', color: 'bg-yellow-100 text-yellow-800' };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Digitale sjekklister</h3>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Ny sjekkliste
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {checklists.map((checklist) => {
          const status = getChecklistStatus(checklist);
          const progress = getChecklistProgress(checklist);
          
          return (
            <Card key={checklist.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{checklist.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={status.color}>
                      {status.status === 'completed' && 'Fullført'}
                      {status.status === 'in_progress' && 'Pågår'}
                      {status.status === 'deviation' && 'Avvik'}
                    </Badge>
                    <span className="text-sm text-gray-600">{progress}</span>
                  </div>
                </div>
                <CardDescription>
                  Klikk "Start kontroll" for å utføre denne sjekklisten
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full"
                  onClick={() => setActiveChecklist(activeChecklist === checklist.id ? null : checklist.id)}
                >
                  {activeChecklist === checklist.id ? 'Lukk sjekkliste' : 'Start kontroll'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {activeChecklist && (
        <Card>
          <CardHeader>
            <CardTitle>
              {checklists.find(c => c.id === activeChecklist)?.title} - Utførelse
            </CardTitle>
            <CardDescription>
              Kryss av hver kontrollpunkt og noter eventuelle avvik
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {checklists.find(c => c.id === activeChecklist)?.items.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      id={item.id}
                      checked={item.completed}
                      onCheckedChange={() => handleItemToggle(activeChecklist, item.id)}
                    />
                    <div className="flex-1">
                      <label htmlFor={item.id} className="font-medium cursor-pointer">
                        {item.title}
                      </label>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={item.deviation ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => handleDeviationToggle(activeChecklist, item.id)}
                      >
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        Avvik
                      </Button>
                    </div>
                  </div>
                  
                  {(item.deviation || item.comment) && (
                    <Textarea
                      placeholder="Kommentar eller beskrivelse av avvik..."
                      value={item.comment || ''}
                      onChange={(e) => handleCommentChange(activeChecklist, item.id, e.target.value)}
                      className="mt-2"
                    />
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button 
                className="flex-1"
                onClick={() => handleSubmitChecklist(activeChecklist)}
                disabled={submitMutation.isPending}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {submitMutation.isPending ? 'Lagrer...' : 'Fullfør kontroll'}
              </Button>
              <Button variant="outline" onClick={() => setActiveChecklist(null)}>
                Avbryt
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
