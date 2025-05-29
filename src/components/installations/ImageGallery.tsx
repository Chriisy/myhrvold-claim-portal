
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Download, ZoomIn } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Photo {
  id: string;
  file_name: string;
  file_url: string;
  caption: string | null;
  uploaded_at: string;
  checklist_item_id: string;
}

interface ImageGalleryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checklistId: string;
  itemId?: string;
}

export const ImageGallery = ({ open, onOpenChange, checklistId, itemId }: ImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<Photo | null>(null);

  const { data: photos, isLoading } = useQuery({
    queryKey: ['checklist-photos', checklistId, itemId],
    queryFn: async () => {
      let query = supabase
        .from('installation_checklist_photos')
        .select('*')
        .eq('checklist_id', checklistId)
        .order('uploaded_at', { ascending: false });

      if (itemId) {
        query = query.eq('checklist_item_id', itemId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Photo[];
    },
    enabled: open
  });

  const downloadImage = (photo: Photo) => {
    const link = document.createElement('a');
    link.href = photo.file_url;
    link.download = photo.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Bildegalleri</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              Bildegalleri {itemId && `- Sjekkliste punkt`}
              {photos && (
                <Badge variant="outline" className="ml-2">
                  {photos.length} bilde{photos.length !== 1 ? 'r' : ''}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto">
            {photos && photos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <img
                      src={photo.file_url}
                      alt={photo.caption || photo.file_name}
                      className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setSelectedImage(photo)}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                      <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="absolute bottom-2 left-2 right-2">
                      {photo.caption && (
                        <div className="bg-black bg-opacity-60 text-white text-xs p-1 rounded truncate">
                          {photo.caption}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Ingen bilder lastet opp ennå
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Full size image modal */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-5xl max-h-[90vh]">
            <DialogHeader>
              <div className="flex justify-between items-start">
                <DialogTitle>{selectedImage.caption || selectedImage.file_name}</DialogTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadImage(selectedImage)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedImage(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </DialogHeader>
            <div className="flex justify-center">
              <img
                src={selectedImage.file_url}
                alt={selectedImage.caption || selectedImage.file_name}
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
            {selectedImage.caption && (
              <div className="text-center text-gray-600 mt-2">
                {selectedImage.caption}
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
