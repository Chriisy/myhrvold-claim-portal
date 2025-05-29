
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Clock, Plus, Camera, AlertTriangle, Eye, Lock, ImageIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ImageUploadModal } from './ImageUploadModal';
import { ImageGallery } from './ImageGallery';
import { DeviationModal } from './DeviationModal';
import { useAuth } from '@/contexts/AuthContext';

interface ChecklistItem {
  id: string;
  text: string;
  required: boolean;
  completed: boolean;
  comments: string;
  photos: string[];
}

interface Deviation {
  id: string;
  category: string;
  severity: 'lav' | 'medium' | 'høy' | 'kritisk';
  description: string;
  action_required: string;
  created_at: string;
}

interface InstallationChecklistProps {
  projectId: string;
}

export const InstallationChecklist = ({ projectId }: InstallationChecklistProps) => {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [deviationModalOpen, setDeviationModalOpen] = useState(false);
  const [selectedItemForUpload, setSelectedItemForUpload] = useState<string | null>(null);
  const [selectedItemForGallery, setSelectedItemForGallery] = useState<string | null>(null);
  const [internalNotes, setInternalNotes] = useState('');
  
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();
  const canViewInternal = hasPermission('manage_users') || hasPermission('view_internal_notes');

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
        setInternalNotes(existing.internal_notes || '');
        return existing;
      }

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

  const { data: photoCount } = useQuery({
    queryKey: ['checklist-photo-count', checklist?.id],
    queryFn: async () => {
      if (!checklist?.id) return {};
      
      const { data, error } = await supabase
        .from('installation_checklist_photos')
        .select('checklist_item_id')
        .eq('checklist_id', checklist.id);
      
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data.forEach(photo => {
        counts[photo.checklist_item_id] = (counts[photo.checklist_item_id] || 0) + 1;
      });
      
      return counts;
    },
    enabled: !!checklist?.id
  });

  const updateChecklistMutation = useMutation({
    mutationFn: async ({ updates }: { updates: any }) => {
      const { error } = await supabase
        .from('installation_checklists')
        .update(updates)
        .eq('project_id', projectId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installation-checklist', projectId] });
    }
  });

  const handleItemToggle = (itemId: string) => {
    if (!checklist) return;

    const items = checklist.checklist_data as unknown as ChecklistItem[];
    const updatedItems = items.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    updateChecklistMutation.mutate({ 
      updates: { checklist_data: updatedItems as any }
    });
    
    toast({
      title: "Sjekkliste oppdatert",
      description: "Endringen er lagret",
    });
  };

  const handleCommentChange = (itemId: string, comments: string) => {
    if (!checklist) return;

    const items = checklist.checklist_data as unknown as ChecklistItem[];
    const updatedItems = items.map(item =>
      item.id === itemId ? { ...item, comments } : item
    );

    updateChecklistMutation.mutate({ 
      updates: { checklist_data: updatedItems as any }
    });
  };

  const handleInternalNotesChange = (notes: string) => {
    setInternalNotes(notes);
    updateChecklistMutation.mutate({ 
      updates: { internal_notes: notes }
    });
  };

  const handleAddDeviation = (deviation: Omit<Deviation, 'id' | 'created_at'>) => {
    if (!checklist) return;

    const currentDeviations = (checklist.deviation_notes as unknown as Deviation[]) || [];
    const newDeviation: Deviation = {
      ...deviation,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };

    const updatedDeviations = [...currentDeviations, newDeviation];
    
    updateChecklistMutation.mutate({ 
      updates: { deviation_notes: updatedDeviations as any }
    });

    toast({
      title: "Avvik registrert",
      description: "Avviket er lagt til"
    });
  };

  const handleRemoveDeviation = (deviationId: string) => {
    if (!checklist) return;

    const currentDeviations = (checklist.deviation_notes as unknown as Deviation[]) || [];
    const updatedDeviations = currentDeviations.filter(d => d.id !== deviationId);
    
    updateChecklistMutation.mutate({ 
      updates: { deviation_notes: updatedDeviations as any }
    });
  };

  const openUploadModal = (itemId: string) => {
    setSelectedItemForUpload(itemId);
    setUploadModalOpen(true);
  };

  const openGallery = (itemId?: string) => {
    setSelectedItemForGallery(itemId || null);
    setGalleryOpen(true);
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

  const items = checklist.checklist_data as unknown as ChecklistItem[];
  const deviations = (checklist.deviation_notes as unknown as Deviation[]) || [];
  const completedCount = items.filter(item => item.completed).length;
  const requiredCount = items.filter(item => item.required).length;
  const completedRequired = items.filter(item => item.required && item.completed).length;

  return (
    <>
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
              {deviations.length > 0 && (
                <Badge variant="destructive">
                  {deviations.length} avvik
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex space-x-2 mt-4">
            <Button variant="outline" onClick={() => setDeviationModalOpen(true)}>
              <AlertTriangle className="w-4 h-4 mr-2" />
              Avviksnotater ({deviations.length})
            </Button>
            <Button variant="outline" onClick={() => openGallery()}>
              <ImageIcon className="w-4 h-4 mr-2" />
              Bildegalleri
            </Button>
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
                    {photoCount?.[item.id] && (
                      <Badge variant="outline" className="text-xs">
                        {photoCount[item.id]} bilde{photoCount[item.id] !== 1 ? 'r' : ''}
                      </Badge>
                    )}
                    {item.completed ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="flex space-x-2 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                      className="p-0 h-auto text-blue-600"
                    >
                      {expandedItem === item.id ? 'Skjul detaljer' : 'Legg til kommentar'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openUploadModal(item.id)}
                      className="p-0 h-auto text-blue-600"
                    >
                      <Camera className="w-4 h-4 mr-1" />
                      Last opp bilde
                    </Button>
                    {photoCount?.[item.id] && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openGallery(item.id)}
                        className="p-0 h-auto text-blue-600"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Se bilder ({photoCount[item.id]})
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {expandedItem === item.id && (
                <div className="ml-7 space-y-3">
                  <Textarea
                    placeholder="Legg til kommentar eller notater..."
                    value={item.comments || ''}
                    onChange={(e) => handleCommentChange(item.id, e.target.value)}
                    rows={3}
                  />
                </div>
              )}
            </div>
          ))}

          {canViewInternal && (
            <>
              <Separator className="my-6" />
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-gray-500" />
                  <h4 className="font-medium">Interne notater</h4>
                  <Badge variant="secondary" className="text-xs">
                    Kun synlig for internt team
                  </Badge>
                </div>
                <Textarea
                  placeholder="Interne kommentarer og observasjoner som ikke skal være synlige for kunde..."
                  value={internalNotes}
                  onChange={(e) => handleInternalNotesChange(e.target.value)}
                  rows={4}
                  className="bg-gray-50"
                />
              </div>
            </>
          )}

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

      {/* Modals */}
      <ImageUploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        checklistId={checklist?.id || ''}
        checklistItemId={selectedItemForUpload || ''}
        onUploadComplete={() => {
          queryClient.invalidateQueries({ queryKey: ['checklist-photo-count'] });
        }}
      />

      <ImageGallery
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        checklistId={checklist?.id || ''}
        itemId={selectedItemForGallery || undefined}
      />

      <DeviationModal
        open={deviationModalOpen}
        onOpenChange={setDeviationModalOpen}
        deviations={deviations}
        onAddDeviation={handleAddDeviation}
        onRemoveDeviation={handleRemoveDeviation}
      />
    </>
  );
};
