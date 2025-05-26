
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FileUploadStepProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  error?: string;
}

export const FileUploadStep: React.FC<FileUploadStepProps> = ({
  onFileSelect,
  isUploading,
  error,
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    multiple: false,
    disabled: isUploading,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Last opp faktura</h2>
        <p className="text-gray-600">
          Velg en CSV, Excel, PDF eller bildefil (JPG/PNG) med fakturalinjer som skal importeres.
          Bilder vil bli analysert automatisk for å trekke ut fakturainformasjon.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="border-2 border-dashed">
        <CardContent className="p-8">
          <div
            {...getRootProps()}
            className={`text-center cursor-pointer transition-colors ${
              isDragActive ? 'bg-blue-50' : ''
            } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} />
            
            <div className="flex flex-col items-center space-y-4">
              {isUploading ? (
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
              ) : (
                <Upload className="h-12 w-12 text-gray-400" />
              )}
              
              <div>
                <p className="text-lg font-medium">
                  {isUploading
                    ? 'Analyserer fil...'
                    : isDragActive
                    ? 'Slipp filen her'
                    : 'Dra og slipp fil hit, eller klikk for å velge'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Støttede formater: CSV, XLS, XLSX, PDF, JPG, PNG
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  💡 Bilder analyseres automatisk med AI for å trekke ut fakturadata
                </p>
              </div>

              {!isUploading && (
                <Button variant="outline" type="button">
                  <FileText className="h-4 w-4 mr-2" />
                  Bla gjennom filer
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
