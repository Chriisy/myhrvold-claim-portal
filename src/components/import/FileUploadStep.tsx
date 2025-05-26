
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, Camera, Brain } from 'lucide-react';
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
        <h2 className="text-xl font-semibold mb-2">Last opp T.Myhrvold faktura</h2>
        <p className="text-gray-600">
          Velg en CSV, Excel, PDF eller bildefil (JPG/PNG) med T.Myhrvold fakturalinjer. 
          AI vil automatisk tolke bildefakturaer og trekke ut kunde-, prosjekt- og teknisk informasjon.
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
                    ? 'Analyserer T.Myhrvold faktura...'
                    : isDragActive
                    ? 'Slipp filen her'
                    : 'Dra og slipp faktura hit, eller klikk for å velge'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Støttede formater: CSV, XLS, XLSX, PDF, JPG, PNG
                </p>
              </div>

              {!isUploading && (
                <>
                  <Button variant="outline" type="button">
                    <FileText className="h-4 w-4 mr-2" />
                    Bla gjennom filer
                  </Button>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <div className="flex items-start gap-3">
                      <div className="flex gap-2">
                        <Camera className="h-5 w-5 text-blue-600 mt-0.5" />
                        <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
                      </div>
                      <div className="text-sm">
                        <p className="font-semibold text-blue-900 mb-2">Smart T.Myhrvold fakturaanalyse</p>
                        <p className="text-blue-700 mb-2">AI tolker automatisk:</p>
                        <ul className="text-blue-600 space-y-1 text-xs">
                          <li>• <strong>Faktisk kunde</strong> (ikke bare T.Myhrvold AS)</li>
                          <li>• <strong>Prosjektnummer</strong> og jobbeskrivelse</li>
                          <li>• <strong>Tekniske detaljer</strong> (maskin, serienr, deler)</li>
                          <li>• <strong>Leverandørinformasjon</strong></li>
                        </ul>
                        <p className="text-blue-700 mt-2 text-xs">
                          <strong>Du setter selv:</strong> Kontokode og garantistatus
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
