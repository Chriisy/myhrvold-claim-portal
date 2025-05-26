
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ChevronLeft, ChevronRight, X, Download, ZoomIn } from 'lucide-react';

interface ClaimFile {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
}

interface ImageGalleryProps {
  files: ClaimFile[];
  onDownload: (file: ClaimFile) => void;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ files, onDownload }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  
  // Filter out only image files
  const imageFiles = files.filter(file => file.file_type.startsWith('image/'));
  
  if (imageFiles.length === 0) {
    return null;
  }

  const openGallery = (index: number) => {
    setSelectedImageIndex(index);
  };

  const closeGallery = () => {
    setSelectedImageIndex(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (selectedImageIndex === null) return;
    
    if (direction === 'prev') {
      setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : imageFiles.length - 1);
    } else {
      setSelectedImageIndex(selectedImageIndex < imageFiles.length - 1 ? selectedImageIndex + 1 : 0);
    }
  };

  return (
    <>
      {/* Thumbnail Gallery */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <ZoomIn className="h-5 w-5" />
          Bildegalleri ({imageFiles.length})
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {imageFiles.map((file, index) => (
            <div
              key={file.id}
              className="relative group cursor-pointer rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-colors aspect-square"
              onClick={() => openGallery(index)}
            >
              <img
                src={file.file_url}
                alt={file.file_name}
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                <p className="text-white text-xs truncate">{file.file_name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full-screen Gallery Modal */}
      <Dialog open={selectedImageIndex !== null} onOpenChange={closeGallery}>
        <DialogContent className="max-w-7xl max-h-[95vh] p-0 bg-black">
          <DialogHeader className="absolute top-4 left-4 z-10">
            <DialogTitle className="text-white">
              {selectedImageIndex !== null && imageFiles[selectedImageIndex]?.file_name}
            </DialogTitle>
          </DialogHeader>
          
          {/* Close and Download buttons */}
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            {selectedImageIndex !== null && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload(imageFiles[selectedImageIndex])}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={closeGallery}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation buttons */}
          {imageFiles.length > 1 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateImage('prev')}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateImage('next')}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Image display */}
          {selectedImageIndex !== null && (
            <div className="flex items-center justify-center w-full h-full p-4">
              <img
                src={imageFiles[selectedImageIndex].file_url}
                alt={imageFiles[selectedImageIndex].file_name}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}

          {/* Image counter */}
          {imageFiles.length > 1 && selectedImageIndex !== null && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
              <span className="text-white text-sm">
                {selectedImageIndex + 1} av {imageFiles.length}
              </span>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
