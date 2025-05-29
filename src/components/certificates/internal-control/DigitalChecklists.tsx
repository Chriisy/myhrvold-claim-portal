
import { useState } from 'react';
import { useChecklistTemplates, useSubmitChecklist } from '@/hooks/useInternalControl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckSquare, Plus, AlertTriangle } from 'lucide-react';
import { EmptyState } from '../EmptyState';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  deviation: boolean;
  comment?: string;
}

export const DigitalChecklists = () => {
  const { data: templates = [], isLoading } = useChecklistTemplates();
  const submitChecklist = useSubmitChecklist();
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);

  const handleStartChecklist = (template: any) => {
    setSelectedTemplate(template);
    setChecklistItems(template.checklist_items.map((item: any, index: number) => ({
      id: `item-${index}`,
      title: item.title || `Punkt ${index + 1}`,
      description: item.description || '',
      completed: false,
      deviation: false,
      comment: ''
    })));
    setChecklistOpen(true);
  };

  const updateChecklistItem = (id: string, updates: Partial<ChecklistItem>) => {
    setChecklistItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const handleSubmitChecklist = async () => {
    if (!selectedTemplate) return;

    try {
      await submitChecklist.mutateAsync({
        documentType: selectedTemplate.document_type || 'general',
        title: selectedTemplate.title,
        checklistItems
      });
      setChecklistOpen(false);
      setSelectedTemplate(null);
      setChecklistItems([]);
    } catch (error) {
      console.error('Submit failed:', error);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Laster sjekklister...</div>;
  }

  if (templates.length === 0) {
    return (
      <EmptyState
        title="Ingen sjekklister ennå"
        description="Opprett din første digitale sjekkliste for internkontroll."
        actionLabel="Opprett sjekkliste"
        onAction={() => {/* TODO: Add template creation */}}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckSquare className="w-5 h-5" />
                {template.title}
              </CardTitle>
              {template.description && (
                <p className="text-sm text-gray-600">{template.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  {template.checklist_items?.length || 0} punkter
                </p>
                <Button 
                  onClick={() => handleStartChecklist(template)}
                  className="w-full"
                >
                  Start sjekkliste
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={checklistOpen} onOpenChange={setChecklistOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate?.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {checklistItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={item.completed}
                        onCheckedChange={(checked) => 
                          updateChecklistItem(item.id, { completed: !!checked })
                        }
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.title}</h4>
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-6">
                      <Checkbox
                        checked={item.deviation}
                        onCheckedChange={(checked) => 
                          updateChecklistItem(item.id, { deviation: !!checked })
                        }
                      />
                      <label className="text-sm text-orange-600 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        Avvik registrert
                      </label>
                    </div>
                    
                    <div className="ml-6">
                      <Textarea
                        placeholder="Kommentar eller beskrivelse av avvik..."
                        value={item.comment}
                        onChange={(e) => 
                          updateChecklistItem(item.id, { comment: e.target.value })
                        }
                        className="text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setChecklistOpen(false)}>
                Avbryt
              </Button>
              <Button 
                onClick={handleSubmitChecklist}
                disabled={submitChecklist.isPending}
              >
                {submitChecklist.isPending ? 'Lagrer...' : 'Fullfør sjekkliste'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DigitalChecklists;
