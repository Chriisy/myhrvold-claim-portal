
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

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

export const useUploadClaimFiles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ claimId, files }: { claimId: string; files: File[] }) => {
      const uploadedFiles = [];

      for (const file of files) {
        const fileId = uuidv4();
        const fileExtension = file.name.split('.').pop();
        const fileName = `${fileId}.${fileExtension}`;
        const filePath = `claims/${claimId}/${fileName}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('claim-files')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Kunne ikke laste opp ${file.name}: ${uploadError.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('claim-files')
          .getPublicUrl(filePath);

        // Save file metadata to database
        const { data: fileRecord, error: dbError } = await supabase
          .from('claim_files')
          .insert({
            claim_id: claimId,
            file_name: file.name,
            file_path: filePath,
            file_size: file.size,
            file_type: file.type,
            file_url: publicUrl,
          })
          .select()
          .single();

        if (dbError) {
          throw new Error(`Kunne ikke lagre filinfo: ${dbError.message}`);
        }
        
        uploadedFiles.push(fileRecord);
      }

      return uploadedFiles;
    },
    onSuccess: (data, variables) => {
      toast({
        title: 'Filer lastet opp',
        description: `${data.length} filer ble lastet opp til reklamasjonen.`,
      });
      queryClient.invalidateQueries({ queryKey: ['claim-files', variables.claimId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Feil ved opplasting',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useClaimFiles = (claimId: string) => {
  return useQuery<ClaimFile[]>({
    queryKey: ['claim-files', claimId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('claim_files')
        .select('*')
        .eq('claim_id', claimId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    },
    enabled: !!claimId,
  });
};

export const useDeleteClaimFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fileId: string) => {
      // First get the file info
      const { data: fileData, error: fetchError } = await supabase
        .from('claim_files')
        .select('file_path, claim_id')
        .eq('id', fileId)
        .single();

      if (fetchError) {
        throw new Error('Kunne ikke finne fil');
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('claim-files')
        .remove([fileData.file_path]);

      if (storageError) {
        throw new Error('Kunne ikke slette fil fra lagring');
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('claim_files')
        .delete()
        .eq('id', fileId);

      if (dbError) {
        throw new Error('Kunne ikke slette filinfo fra database');
      }

      return { fileId, claimId: fileData.claim_id };
    },
    onSuccess: (data) => {
      toast({
        title: 'Fil slettet',
        description: 'Filen ble slettet fra reklamasjonen.',
      });
      queryClient.invalidateQueries({ queryKey: ['claim-files', data.claimId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Feil ved sletting',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
