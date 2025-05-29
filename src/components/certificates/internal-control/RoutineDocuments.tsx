import { useState } from 'react';
import { useInternalControlDocuments, useUploadDocument } from '@/hooks/useInternalControl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, FileText, Calendar, User } from 'lucide-react';
import { EmptyState } from '../EmptyState';

export const RoutineDocuments = () => {
  const { data: documents = [], isLoading } = useInternalControlDocuments();
  const uploadDocument = useUploadDocument();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    documentType: '',
    version: '',
    file: null as File | null
  });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file) return;

    try {
      await uploadDocument.mutateAsync({
        file: formData.file,
        documentType: formData.documentType,
        title: formData.title,
        version: formData.version
      });
      setUploadOpen(false);
      setFormData({ title: '', documentType: '', version: '', file: null });
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Laster dokumenter...</div>;
  }

  if (documents.length === 0) {
    return (
      <>
        <EmptyState
          title="Ingen rutinedokumenter ennå"
          description="Last opp ditt første rutinedokument for internkontroll."
          actionLabel="Last opp dokument"
          onAction={() => setUploadOpen(true)}
        />
        
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Last opp rutinedokument</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <Label htmlFor="title">Tittel</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="documentType">Dokumenttype</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, documentType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg dokumenttype" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="procedure">Prosedyre</SelectItem>
                    <SelectItem value="instruction">Instruksjon</SelectItem>
                    <SelectItem value="checklist">Sjekkliste</SelectItem>
                    <SelectItem value="form">Skjema</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="version">Versjon</Label>
                <Input
                  id="version"
                  value={formData.version}
                  onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                  placeholder="f.eks. 1.0"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="file">Fil</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setFormData(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                  required
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setUploadOpen(false)}>
                  Avbryt
                </Button>
                <Button type="submit" disabled={uploadDocument.isPending}>
                  {uploadDocument.isPending ? 'Laster opp...' : 'Last opp'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Rutinedokumenter
        </CardTitle>
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Last opp dokument
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Last opp rutinedokument</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <Label htmlFor="title">Tittel</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="documentType">Dokumenttype</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, documentType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg dokumenttype" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="procedure">Prosedyre</SelectItem>
                    <SelectItem value="instruction">Instruksjon</SelectItem>
                    <SelectItem value="checklist">Sjekkliste</SelectItem>
                    <SelectItem value="form">Skjema</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="version">Versjon</Label>
                <Input
                  id="version"
                  value={formData.version}
                  onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                  placeholder="f.eks. 1.0"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="file">Fil</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setFormData(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                  required
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setUploadOpen(false)}>
                  Avbryt
                </Button>
                <Button type="submit" disabled={uploadDocument.isPending}>
                  {uploadDocument.isPending ? 'Laster opp...' : 'Last opp'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tittel</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Versjon</TableHead>
              <TableHead>Lastet opp</TableHead>
              <TableHead>Handlinger</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium">{doc.title}</TableCell>
                <TableCell>{doc.document_type}</TableCell>
                <TableCell>{doc.version}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    {new Date(doc.uploaded_at).toLocaleDateString('nb-NO')}
                  </div>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" asChild>
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                      Åpne
                    </a>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RoutineDocuments;
