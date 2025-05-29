
import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Upload, X, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ErrorService } from '@/services/errorHandling/errorService';

interface ImageUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checklistId: string;
  checklistItemId: string;
  onUploadComplete: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Kun JPEG, PNG og WebP bilder er tillatt';
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return `Fil er for stor. Maksimal størrelse er ${MAX_FILE_SIZE / 1024 / 1024}MB`;
    }
    
    return null;
  }, []);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setValidationError(null);
    
    if (file) {
      const error = validateFile(file);
      if (error) {
        setValidationError(error);
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    }
  }, [validateFile]);

  const resetForm = useCallback(() => {
    setSelectedFile(null);
    setCaption('');
    setUploadProgress(0);
    setValidationError(null);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile || !checklistId || !checklistItemId) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Ikke innlogget');

      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.user.id}/${checklistId}/${checklistItemId}/${fileName}`;

      // Simulate upload progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const { error: uploadError } = await supabase.storage
        .from('installation-photos')
        .upload(filePath, selectedFile);

      clearInterval(progressInterval);

      if (uploadError) {
        throw uploadError;
      }

      setUploadProgress(95);

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
          caption: caption.trim() || null,
          uploaded_by: user.user.id
        });

      if (dbError) throw dbError;

      setUploadProgress(100);

      toast({
        title: "Bilde lastet opp",
        description: "Bildet er lagret og tilgjengelig i galleriet"
      });

      resetForm();
      onUploadComplete();
      onOpenChange(false);
    } catch (error) {
      console.error('Upload error:', error);
      ErrorService.handleSupabaseError(error as any, 'laste opp bilde', {
        component: 'ImageUploadModal',
        severity: 'medium'
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [selectedFile, checklistId, checklistItemId, caption, resetForm, onUploadComplete, onOpenChange]);

  const handleClose = useCallback(() => {
    if (!uploading) {
      resetForm();
      onOpenChange(false);
    }
  }, [uploading, resetForm, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Last opp bilde</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="file-upload">Velg bilde</Label>
            <Input
              id="file-upload"
              type="file"
              accept={ALLOWED_TYPES.join(',')}
              onChange={handleFileSelect}
              className="mt-1"
              disabled={uploading}
              aria-describedby={validationError ? "file-error" : undefined}
            />
            {validationError && (
              <div id="file-error" className="flex items-center space-x-2 mt-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{validationError}</span>
              </div>
            )}
          </div>
          
          {selectedFile && !validationError && (
            <div className="space-y-3">
              <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                <div className="font-medium">{selectedFile.name}</div>
                <div className="text-xs">
                  Størrelse: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
              
              <div>
                <Label htmlFor="caption">Bildetekst (valgfritt)</Label>
                <Textarea
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Beskriv bildet..."
                  rows={3}
                  disabled={uploading}
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {caption.length}/500 tegn
                </div>
              </div>
            </div>
          )}

          {uploading && uploadProgress > 0 && (
            <div className="space-y-2">
              <Label>Laster opp...</Label>
              <Progress value={uploadProgress} className="w-full" />
              <div className="text-sm text-gray-600 text-center">
                {uploadProgress}% fullført
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={handleClose}
              disabled={uploading}
            >
              Avbryt
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || !!validationError || uploading}
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
