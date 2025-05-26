
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useClaimFiles, useDeleteClaimFile, useUploadClaimFiles } from '@/hooks/useClaimFiles';
import { useDropzone } from 'react-dropzone';
import { ImageGallery } from './ImageGallery';
import { 
  FileText, 
  Image, 
  Download, 
  Trash2, 
  Upload, 
  Eye,
  AlertCircle 
} from 'lucide-react';

interface ClaimFilesProps {
  claimId: string;
}

interface ClaimFile {
  id: string;
  claim_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  file_url: string;
  created_at: string;
}

export const ClaimFiles: React.FC<ClaimFilesProps> = ({ claimId }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { data: files, isLoading } = useClaimFiles(claimId);
  const uploadFiles = useUploadClaimFiles();
  const deleteFile = useDeleteClaimFile();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        uploadFiles.mutate({ claimId, files: acceptedFiles });
      }
    },
  });

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-5 w-5 text-blue-600" />;
    }
    return <FileText className="h-5 w-5 text-gray-600" />;
  };

  const getFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const handleDownload = (file: ClaimFile) => {
    window.open(file.file_url, '_blank');
  };

  const handleDelete = (fileId: string) => {
    if (confirm('Er du sikker på at du vil slette denne filen?')) {
      deleteFile.mutate(fileId);
    }
  };

  const handleImageView = (fileUrl: string) => {
    setSelectedImage(fileUrl);
  };

  // Separate files into images and documents
  const imageFiles = files?.filter(file => file.file_type.startsWith('image/')) || [];
  const documentFiles = files?.filter(file => !file.file_type.startsWith('image/')) || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vedlegg</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Vedlegg ({files?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload area */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${isDragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            {isDragActive ? (
              <p className="text-blue-600 font-medium">Slipp filene her...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-1">
                  Dra og slipp filer her, eller klikk for å velge
                </p>
                <p className="text-sm text-gray-500">
                  Bilder, PDF, Word-dokumenter (maks 10MB)
                </p>
              </div>
            )}
          </div>

          {uploadFiles.isPending && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
              <span className="text-blue-700">Laster opp filer...</span>
            </div>
          )}

          {/* Image Gallery */}
          {imageFiles.length > 0 && (
            <ImageGallery files={imageFiles} onDownload={handleDownload} />
          )}

          {/* Document files list */}
          {documentFiles.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Dokumenter ({documentFiles.length})</h3>
              {documentFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getFileIcon(file.file_type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{file.file_name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{getFileSize(file.file_size)}</span>
                        <Badge variant="outline" className="text-xs">
                          {file.file_type.split('/')[1]?.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(file)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(file.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* All image files list for reference */}
          {imageFiles.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Bildefiler ({imageFiles.length})</h3>
              {imageFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getFileIcon(file.file_type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{file.file_name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{getFileSize(file.file_size)}</span>
                        <Badge variant="outline" className="text-xs">
                          {file.file_type.split('/')[1]?.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(file)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(file.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {(!files || files.length === 0) && (
            <div className="text-center p-8 text-gray-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Ingen vedlegg lastet opp ennå</p>
              <p className="text-sm">Dra og slipp filer eller klikk for å legge til</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legacy single image preview dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Bildevisning</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="flex justify-center">
              <img
                src={selectedImage}
                alt="Vedlegg"
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
