
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, Download, FileText, Calendar, User, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { useInternalControlDocuments, useUploadDocument } from '@/hooks/useInternalControl';

const DOCUMENT_TYPES = [
  { key: 'lekkasjekontroll', label: 'Lekkasjekontroll', color: 'bg-blue-100 text-blue-800' },
  { key: 'tomming_gjenvinning', label: 'Tømming og gjenvinning', color: 'bg-green-100 text-green-800' },
  { key: 'pafylling', label: 'Påfylling av kuldemedium', color: 'bg-purple-100 text-purple-800' },
  { key: 'egenkontroll', label: 'Egenkontroll', color: 'bg-orange-100 text-orange-800' },
];

export const RoutineDocuments = () => {
  const { data: documents = [], isLoading } = useInternalControlDocuments();
  const uploadMutation = useUploadDocument();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('');
  const [uploadForm, setUploadForm] = useState({
    title: '',
    version: '',
    file: null as File | null
  });

  const handleUpload = (documentType: string) => {
    setSelectedDocumentType(documentType);
    setUploadForm({
      title: '',
      version: '1.0',
      file: null
    });
    setShowUploadModal(true);
  };

  const handleFileSubmit = () => {
    if (!uploadForm.file || !uploadForm.title || !uploadForm.version) {
      return;
    }

    uploadMutation.mutate({
      file: uploadForm.file,
      documentType: selectedDocumentType,
      title: uploadForm.title,
      version: uploadForm.version
    }, {
      onSuccess: () => {
        setShowUploadModal(false);
        setUploadForm({ title: '', version: '', file: null });
      }
    });
  };

  const getLatestDocument = (documentType: string) => {
    return documents
      .filter(doc => doc.document_type === documentType)
      .sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime())[0];
  };

  const getDocumentTypeInfo = (type: string) => {
    return DOCUMENT_TYPES.find(dt => dt.key === type) || DOCUMENT_TYPES[0];
  };

  if (isLoading) {
    return <div className="text-center py-4">Laster dokumenter...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DOCUMENT_TYPES.map((docType) => {
          const latestDoc = getLatestDocument(docType.key);
          
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
                    disabled={uploadMutation.isPending}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadMutation.isPending ? 'Laster opp...' : 'Last opp ny versjon'}
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

      {/* Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Last opp nytt rutinedokument</DialogTitle>
            <DialogDescription>
              {selectedDocumentType && getDocumentTypeInfo(selectedDocumentType).label}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Tittel</Label>
              <Input
                id="title"
                value={uploadForm.title}
                onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="F.eks. Rutine for lekkasjekontroll 2025"
              />
            </div>
            
            <div>
              <Label htmlFor="version">Versjon</Label>
              <Input
                id="version"
                value={uploadForm.version}
                onChange={(e) => setUploadForm(prev => ({ ...prev, version: e.target.value }))}
                placeholder="F.eks. 1.0, 2.1"
              />
            </div>
            
            <div>
              <Label htmlFor="file">Fil</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setUploadForm(prev => ({ ...prev, file: file || null }));
                }}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowUploadModal(false)}>
                Avbryt
              </Button>
              <Button 
                onClick={handleFileSubmit}
                disabled={!uploadForm.file || !uploadForm.title || !uploadForm.version || uploadMutation.isPending}
              >
                {uploadMutation.isPending ? 'Laster opp...' : 'Last opp'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
