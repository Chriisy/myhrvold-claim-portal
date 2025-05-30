
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Download, ZoomIn, Images } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Photo {
  id: string;
  file_name: string;
  file_url: string;
  caption: string | null;
  uploaded_at: string;
  checklist_item_id: string | null;
  project_id: string;
}

interface InstallationImageGalleryProps {
  projectId: string;
}

export const InstallationImageGallery = ({ projectId }: InstallationImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<Photo | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);

  const { data: photos, isLoading } = useQuery({
    queryKey: ['installation-photos', projectId],
    queryFn: async () => {
      // Get photos from both tables
      const [checklistPhotos, projectPhotos] = await Promise.all([
        supabase
          .from('installation_checklist_photos')
          .select('*')
          .eq('checklist_id', projectId)
          .order('uploaded_at', { ascending: false }),
        supabase
          .from('installation_photos')
          .select('*')
          .eq('project_id', projectId)
          .order('uploaded_at', { ascending: false })
      ]);

      if (checklistPhotos.error) throw checklistPhotos.error;
      if (projectPhotos.error) throw projectPhotos.error;

      // Combine and normalize the photos
      const allPhotos: Photo[] = [
        ...(checklistPhotos.data || []).map(photo => ({
          id: photo.id,
          file_name: photo.file_name,
          file_url: photo.file_url,
          caption: photo.caption,
          uploaded_at: photo.uploaded_at,
          checklist_item_id: photo.checklist_item_id,
          project_id: projectId
        })),
        ...(projectPhotos.data || []).map(photo => ({
          id: photo.id,
          file_name: photo.file_name,
          file_url: photo.file_url,
          caption: photo.caption,
          uploaded_at: photo.uploaded_at,
          checklist_item_id: photo.checklist_item_id,
          project_id: photo.project_id
        }))
      ];

      // Sort by upload date (newest first)
      return allPhotos.sort((a, b) => 
        new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
      );
    }
  });

  const downloadImage = (photo: Photo) => {
    const link = document.createElement('a');
    link.href = photo.file_url;
    link.download = photo.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Images className="w-5 h-5" />
              Bildegalleri
            </CardTitle>
            <Badge variant="outline">
              {photos?.length || 0} bilde{photos?.length !== 1 ? 'r' : ''}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : photos && photos.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                {photos.slice(0, 8).map((photo) => (
                  <div key={photo.id} className="relative group cursor-pointer">
                    <img
                      src={photo.file_url}
                      alt={photo.caption || photo.file_name}
                      className="w-full h-24 object-cover rounded-lg hover:opacity-80 transition-opacity"
                      onClick={() => setSelectedImage(photo)}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                      <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    {photo.caption && (
                      <div className="absolute bottom-1 left-1 right-1">
                        <div className="bg-black bg-opacity-60 text-white text-xs p-1 rounded truncate">
                          {photo.caption}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <Button 
                onClick={() => setGalleryOpen(true)}
                variant="outline" 
                className="w-full"
              >
                <Images className="w-4 h-4 mr-2" />
                Se alle bilder ({photos.length})
              </Button>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Images className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Ingen bilder lastet opp ennå</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full Gallery Modal */}
      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              Komplett bildegalleri
              <Badge variant="outline" className="ml-2">
                {photos?.length || 0} bilde{photos?.length !== 1 ? 'r' : ''}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[70vh]">
            {photos && photos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                      <div className="bg-black bg-opacity-60 text-white text-xs p-1 rounded mt-1">
                        {new Date(photo.uploaded_at).toLocaleDateString('nb-NO')}
                      </div>
                      {photo.checklist_item_id && (
                        <div className="bg-blue-600 bg-opacity-80 text-white text-xs p-1 rounded mt-1">
                          Sjekkliste
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Ingen bilder funnet
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Individual Image Modal */}
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
            <div className="text-center text-sm text-gray-600 space-y-1">
              {selectedImage.caption && (
                <div>{selectedImage.caption}</div>
              )}
              <div>Lastet opp: {new Date(selectedImage.uploaded_at).toLocaleDateString('nb-NO')}</div>
              {selectedImage.checklist_item_id && (
                <Badge variant="secondary">Tilknyttet sjekkliste</Badge>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
