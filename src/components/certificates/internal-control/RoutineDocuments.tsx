
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Download, FileText, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';

interface RoutineDocument {
  id: string;
  document_type: string;
  title: string;
  version: string;
  file_url: string;
  uploaded_by: string;
  uploaded_at: string;
}

const DOCUMENT_TYPES = [
  { key: 'lekkasjekontroll', label: 'Lekkasjekontroll', color: 'bg-blue-100 text-blue-800' },
  { key: 'tomming_gjenvinning', label: 'Tømming og gjenvinning', color: 'bg-green-100 text-green-800' },
  { key: 'pafylling', label: 'Påfylling av kuldemedium', color: 'bg-purple-100 text-purple-800' },
  { key: 'egenkontroll', label: 'Egenkontroll', color: 'bg-orange-100 text-orange-800' },
];

export const RoutineDocuments = () => {
  const [documents] = useState<RoutineDocument[]>([]);
  const [uploadingType, setUploadingType] = useState<string | null>(null);

  const handleUpload = (documentType: string) => {
    setUploadingType(documentType);
    // Implement file upload logic here
    console.log('Uploading document for:', documentType);
  };

  const getDocumentTypeInfo = (type: string) => {
    return DOCUMENT_TYPES.find(dt => dt.key === type) || DOCUMENT_TYPES[0];
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DOCUMENT_TYPES.map((docType) => {
          const latestDoc = documents.find(doc => doc.document_type === docType.key);
          
          return (
            <Card key={docType.key} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{docType.label}</CardTitle>
                  <Badge className={docType.color}>
                    {latestDoc ? `v${latestDoc.version}` : 'Ingen dokument'}
                  </Badge>
                </div>
                <CardDescription>
                  {latestDoc 
                    ? `Sist oppdatert ${format(new Date(latestDoc.uploaded_at), 'dd.MM.yyyy', { locale: nb })}`
                    : 'Ingen rutinedokument lastet opp'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {latestDoc && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>Lastet opp av: {latestDoc.uploaded_by}</span>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleUpload(docType.key)}
                    disabled={uploadingType === docType.key}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingType === docType.key ? 'Laster opp...' : 'Last opp ny versjon'}
                  </Button>
                  
                  {latestDoc && (
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Last ned
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Alle dokumenter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {documents.map((doc) => {
                const typeInfo = getDocumentTypeInfo(doc.document_type);
                
                return (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-500" />
                      <div>
                        <h4 className="font-medium">{doc.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                          <span>v{doc.version}</span>
                          <span>•</span>
                          <span>{format(new Date(doc.uploaded_at), 'dd.MM.yyyy', { locale: nb })}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Last ned
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
