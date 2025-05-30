
import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertTriangle, ImageIcon, Lock } from 'lucide-react';
import { ChecklistItem } from './ChecklistItem';
import { ChecklistLoading } from './ChecklistLoading';
import { ImageUploadModal } from './ImageUploadModal';
import { ImageGallery } from './ImageGallery';
import { DeviationModal } from './DeviationModal';
import { useInstallationChecklist } from '@/hooks/useInstallationChecklist';
import { usePhotoCount } from '@/hooks/usePhotoCount';
import { useAuth } from '@/contexts/AuthContext';
import { useDebounce } from '@/utils/performance/performanceUtils';

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
  
  const { hasPermission } = useAuth();
  const canViewInternal = hasPermission('manage_users') || hasPermission('view_internal_notes');

  const {
    checklist,
    isLoading,
    error,
    toggleItem,
    updateComment,
    updateInternalNotes,
    addDeviation,
    removeDeviation,
    isUpdating
  } = useInstallationChecklist(projectId);

  const { data: photoCount = {} } = usePhotoCount(checklist?.id);

  // Set internal notes when checklist loads
  React.useEffect(() => {
    if (checklist?.internal_notes && internalNotes !== checklist.internal_notes) {
      setInternalNotes(checklist.internal_notes);
    }
  }, [checklist?.internal_notes]);

  const debouncedInternalNotesChange = useDebounce((notes: string) => {
    updateInternalNotes(notes);
  }, 1000);

  const handleInternalNotesChange = useCallback((notes: string) => {
    setInternalNotes(notes);
    debouncedInternalNotesChange(notes);
  }, [debouncedInternalNotesChange]);

  const handleToggleExpanded = useCallback((itemId: string) => {
    setExpandedItem(prev => prev === itemId ? null : itemId);
  }, []);

  const handleUploadPhoto = useCallback((itemId: string) => {
    setSelectedItemForUpload(itemId);
    setUploadModalOpen(true);
  }, []);

  const handleViewPhotos = useCallback((itemId?: string) => {
    setSelectedItemForGallery(itemId || null);
    setGalleryOpen(true);
  }, []);

  const handleUploadComplete = useCallback(() => {
    // Photo count will be automatically updated via React Query
  }, []);

  // Memoized calculations
  const stats = useMemo(() => {
    if (!checklist) return { completedCount: 0, requiredCount: 0, completedRequired: 0 };
    
    const items = checklist.checklist_data as unknown as ChecklistItem[];
    const completedCount = items.filter(item => item.completed).length;
    const requiredCount = items.filter(item => item.required).length;
    const completedRequired = items.filter(item => item.required && item.completed).length;
    
    return { completedCount, requiredCount, completedRequired, totalItems: items.length };
  }, [checklist]);

  const deviations = useMemo(() => {
    return (checklist?.deviation_notes as unknown as Deviation[]) || [];
  }, [checklist?.deviation_notes]);

  const items = useMemo(() => {
    return (checklist?.checklist_data as unknown as ChecklistItem[]) || [];
  }, [checklist?.checklist_data]);

  const allRequiredCompleted = stats.completedRequired === stats.requiredCount && stats.requiredCount > 0;

  if (isLoading) {
    return <ChecklistLoading />;
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sjekkliste</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Kunne ikke laste sjekkliste
            </h3>
            <p className="text-gray-600 mb-4">
              Det oppstod en feil ved lasting av sjekklisten. Prøv å laste siden på nytt.
            </p>
            <Button onClick={() => window.location.reload()}>
              Last på nytt
            </Button>
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
          <div className="text-center py-8">
            <p className="text-gray-600">Ingen sjekkliste funnet for dette prosjektet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Installasjonsjekkliste</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {stats.completedCount}/{stats.totalItems} fullført
              </Badge>
              <Badge variant={allRequiredCompleted ? "default" : "secondary"}>
                {stats.completedRequired}/{stats.requiredCount} påkrevd
              </Badge>
              {deviations.length > 0 && (
                <Badge variant="destructive">
                  {deviations.length} avvik
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex space-x-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setDeviationModalOpen(true)}
              disabled={isUpdating}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Avviksnotater ({deviations.length})
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleViewPhotos()}
              disabled={isUpdating}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Bildegalleri
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {items.map((item) => (
            <ChecklistItem
              key={item.id}
              item={item}
              onToggle={toggleItem}
              onCommentChange={updateComment}
              onUploadPhoto={handleUploadPhoto}
              onViewPhotos={handleViewPhotos}
              photoCount={photoCount[item.id]}
              isExpanded={expandedItem === item.id}
              onToggleExpanded={() => handleToggleExpanded(item.id)}
            />
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
                  disabled={isUpdating}
                  aria-label="Interne notater"
                />
              </div>
            </>
          )}

          {allRequiredCompleted && (
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
        onUploadComplete={handleUploadComplete}
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
        onAddDeviation={addDeviation}
        onRemoveDeviation={removeDeviation}
      />
    </>
  );
};
