
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Clock, AlertTriangle, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  deviation: boolean;
  comment?: string;
}

interface Checklist {
  id: string;
  type: string;
  title: string;
  last_completed?: string;
  completed_by?: string;
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
      }
    ]
  },
  {
    id: '2',
    type: 'egenkontroll',
    title: 'Egenkontroll',
    items: [
      {
        id: '2-1',
        title: 'Kontroll av loggføring',
        description: 'Verifiser at alle aktiviteter er korrekt dokumentert',
        completed: false,
        deviation: false
      },
      {
        id: '2-2',
        title: 'Sertifikatgyldighetskontroll',
        description: 'Sjekk at alle relevante sertifikater er gyldige',
        completed: false,
        deviation: false
      }
    ]
  }
];

export const DigitalChecklists = () => {
  const [checklists, setChecklists] = useState<Checklist[]>(SAMPLE_CHECKLISTS);
  const [activeChecklist, setActiveChecklist] = useState<string | null>(null);

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
                  {checklist.last_completed 
                    ? `Sist fullført ${format(new Date(checklist.last_completed), 'dd.MM.yyyy', { locale: nb })}`
                    : 'Ikke fullført tidligere'
                  }
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
            
            <div className="flex gap-2 pt-4">
              <Button className="flex-1">
                <CheckCircle className="w-4 h-4 mr-2" />
                Fullfør kontroll
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
