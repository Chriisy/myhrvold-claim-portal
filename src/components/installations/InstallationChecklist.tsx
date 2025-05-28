
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ChecklistItem {
  id: string;
  text: string;
  required: boolean;
  completed: boolean;
  comments: string;
  photos: string[];
}

interface InstallationChecklistProps {
  projectId: string;
}

export const InstallationChecklist = ({ projectId }: InstallationChecklistProps) => {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: checklist, isLoading } = useQuery({
    queryKey: ['installation-checklist', projectId],
    queryFn: async () => {
      // First try to get existing checklist
      const { data: existing } = await supabase
        .from('installation_checklists')
        .select('*')
        .eq('project_id', projectId)
        .single();

      if (existing) {
        return existing;
      }

      // If no checklist exists, create one from template
      const { data: template } = await supabase
        .from('checklist_templates')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .single();

      if (!template) {
        throw new Error('Ingen aktiv sjekkliste-mal funnet');
      }

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Ikke innlogget');

      const { data: newChecklist, error } = await supabase
        .from('installation_checklists')
        .insert({
          project_id: projectId,
          template_id: template.id,
          checklist_data: template.checklist_items
        })
        .select()
        .single();

      if (error) throw error;
      return newChecklist;
    }
  });

  const updateChecklistMutation = useMutation({
    mutationFn: async ({ checklistData }: { checklistData: ChecklistItem[] }) => {
      const { error } = await supabase
        .from('installation_checklists')
        .update({ checklist_data: checklistData })
        .eq('project_id', projectId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installation-checklist', projectId] });
    }
  });

  const handleItemToggle = (itemId: string) => {
    if (!checklist) return;

    const items = checklist.checklist_data as ChecklistItem[];
    const updatedItems = items.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    updateChecklistMutation.mutate({ checklistData: updatedItems });
    
    toast({
      title: "Sjekkliste oppdatert",
      description: "Endringen er lagret",
    });
  };

  const handleCommentChange = (itemId: string, comments: string) => {
    if (!checklist) return;

    const items = checklist.checklist_data as ChecklistItem[];
    const updatedItems = items.map(item =>
      item.id === itemId ? { ...item, comments } : item
    );

    updateChecklistMutation.mutate({ checklistData: updatedItems });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sjekkliste</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!checklist) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sjekkliste</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Kunne ikke laste sjekkliste</p>
        </CardContent>
      </Card>
    );
  }

  const items = checklist.checklist_data as ChecklistItem[];
  const completedCount = items.filter(item => item.completed).length;
  const requiredCount = items.filter(item => item.required).length;
  const completedRequired = items.filter(item => item.required && item.completed).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Installasjonsjekkliste</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {completedCount}/{items.length} fullført
            </Badge>
            <Badge variant={completedRequired === requiredCount ? "default" : "secondary"}>
              {completedRequired}/{requiredCount} påkrevd
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start space-x-3">
              <Checkbox
                checked={item.completed}
                onCheckedChange={() => handleItemToggle(item.id)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className={`${item.completed ? 'line-through text-gray-500' : ''}`}>
                    {item.text}
                  </span>
                  {item.required && (
                    <Badge variant="destructive" className="text-xs">
                      Påkrevd
                    </Badge>
                  )}
                  {item.completed ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                  className="mt-2 p-0 h-auto text-blue-600"
                >
                  {expandedItem === item.id ? 'Skjul detaljer' : 'Legg til kommentar'}
                </Button>
              </div>
            </div>

            {expandedItem === item.id && (
              <div className="ml-7 space-y-3">
                <Textarea
                  placeholder="Legg til kommentar eller notater..."
                  value={item.comments}
                  onChange={(e) => handleCommentChange(item.id, e.target.value)}
                  rows={3}
                />
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Plus className="w-4 h-4" />
                  <span>Bildeopplasting kommer snart</span>
                </div>
              </div>
            )}
          </div>
        ))}

        {completedRequired === requiredCount && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Alle påkrevde punkter er fullført!</span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              Installasjonen kan nå markeres som ferdig.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
