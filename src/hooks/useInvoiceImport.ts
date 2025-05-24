import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { ParsedInvoiceLine } from '@/types/invoice';
import { useToast } from '@/hooks/use-toast';

export const useInvoiceImport = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const uploadFile = useMutation({
    mutationFn: async (file: File) => {
      const file_id = uuidv4();
      const { data, error } = await supabase.storage
        .from('invoice-import')
        .upload(`${file_id}/${file.name}`, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw error;
      }

      return { path: data?.path, file_id, filename: file.name };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice-imports'] });
    },
    onError: (error: any) => {
      toast({
        title: "Feil",
        description: `Kunne ikke laste opp fil: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const importLines = useMutation({
    mutationFn: async (data: {
      file_id: string;
      lines: ParsedInvoiceLine[];
      filename: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create import record with proper Json typing
      const metaJson = {
        filename: data.filename,
        uploaded_at: new Date().toISOString(),
        lines: data.lines as any, // Cast to any for Json compatibility
      };

      const { data: importRecord, error } = await supabase
        .from('invoice_imports')
        .insert({
          file_id: data.file_id,
          created_by: user.id,
          meta_json: metaJson,
        })
        .select()
        .single();

      if (error) throw error;
      return importRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice-imports'] });
    },
    onError: (error: any) => {
      toast({
        title: "Feil",
        description: `Kunne ikke importere linjer: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const getImports = async () => {
    const { data, error } = await supabase
      .from('invoice_imports')
      .select('*');

    if (error) {
      throw error;
    }

    return data;
  };

  return {
    uploadFile,
    importLines,
    getImports,
  };
};
