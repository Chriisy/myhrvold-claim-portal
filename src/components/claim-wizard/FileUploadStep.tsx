
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, FileText, Image } from 'lucide-react';

interface FileWithPreview extends File {
  preview?: string;
}

interface FileUploadStepProps {
  files: FileWithPreview[];
  onFilesChange: (files: FileWithPreview[]) => void;
}

export function FileUploadStep({ files, onFilesChange }: FileUploadStepProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => {
      const fileWithPreview = file as FileWithPreview;
      if (file.type.startsWith('image/')) {
        fileWithPreview.preview = URL.createObjectURL(file);
      }
      return fileWithPreview;
    });
    
    onFilesChange([...files, ...newFiles]);
  }, [files, onFilesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeFile = (index: number) => {
    const newFiles = [...files];
    if (newFiles[index].preview) {
      URL.revokeObjectURL(newFiles[index].preview!);
    }
    newFiles.splice(index, 1);
    onFilesChange(newFiles);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-myhrvold-primary mb-4">
          Vedlegg og dokumenter
        </h3>
        <p className="text-gray-600 mb-6">
          Last opp bilder, dokumenter eller andre filer som er relevante for reklamasjonen.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive 
                ? 'border-myhrvold-primary bg-myhrvold-primary/5' 
                : 'border-gray-300 hover:border-myhrvold-primary hover:bg-gray-50'
              }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-myhrvold-primary font-medium">
                Slipp filene her...
              </p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">
                  Dra og slipp filer her, eller klikk for å velge
                </p>
                <p className="text-sm text-gray-500">
                  Støtter bilder, PDF, Word-dokumenter og tekstfiler (maks 10MB)
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h4 className="font-semibold mb-4">Valgte filer ({files.length})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {files.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {getFileIcon(file)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {file.preview && (
                    <div className="mt-2">
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
