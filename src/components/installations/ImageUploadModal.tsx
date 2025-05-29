
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ImageUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checklistId: string;
  checklistItemId: string;
  onUploadComplete: () => void;
}

export const ImageUploadModal = ({ 
  open, 
  onOpenChange, 
  checklistId, 
  checklistItemId, 
  onUploadComplete 
}: ImageUploadModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "Fil for stor",
          description: "Maksimal filstørrelse er 10MB",
          variant: "destructive"
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Ikke innlogget');

      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.user.id}/${checklistId}/${checklistItemId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('installation-photos')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('installation-photos')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('installation_checklist_photos')
        .insert({
          checklist_id: checklistId,
          checklist_item_id: checklistItemId,
          file_name: selectedFile.name,
          file_path: filePath,
          file_url: publicUrl,
          file_size: selectedFile.size,
          caption: caption,
          uploaded_by: user.user.id
        });

      if (dbError) throw dbError;

      toast({
        title: "Bilde lastet opp",
        description: "Bildet er lagret"
      });

      setSelectedFile(null);
      setCaption('');
      onUploadComplete();
      onOpenChange(false);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Feil ved opplasting",
        description: "Kunne ikke laste opp bildet",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Last opp bilde</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="file-upload">Velg bilde</Label>
            <Input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="mt-1"
            />
          </div>
          
          {selectedFile && (
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                Valgt fil: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </div>
              <div>
                <Label htmlFor="caption">Bildetekst (valgfritt)</Label>
                <Textarea
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Beskriv bildet..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Avbryt
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || uploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Laster opp...' : 'Last opp'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
