
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { ParsedInvoiceLine, MappedInvoiceLine } from '@/types/invoice';
import { useToast } from '@/hooks/use-toast';

export const useUploadFile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
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
};

export const useCreateInvoiceImport = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
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
        .from('invoice_import')
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
};

export const useProcessImport = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      importId: string;
      mappedLines: MappedInvoiceLine[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Process each mapped line
      for (const line of data.mappedLines) {
        if (!line.claim_id) continue;

        if (line.type === 'cost') {
          const { error } = await supabase
            .from('cost_line')
            .insert({
              claim_id: line.claim_id,
              description: line.description,
              amount: line.amount,
              konto_nr: line.konto,
              voucher_no: line.voucher,
              source: 'import',
            });

          if (error) throw error;
        } else if (line.type === 'credit') {
          const { error } = await supabase
            .from('credit_note')
            .insert({
              claim_id: line.claim_id,
              description: line.description,
              amount: line.amount,
              konto_nr: line.konto,
              voucher_no: line.voucher,
              source: 'import',
            });

          if (error) throw error;
        }
      }

      // Update import status
      const { error: updateError } = await supabase
        .from('invoice_import')
        .update({ status: 'completed' })
        .eq('id', data.importId);

      if (updateError) throw updateError;

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice-imports'] });
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      toast({
        title: "Import fullført",
        description: "Fakturalinjer har blitt importert til reklamasjonene.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Feil",
        description: `Kunne ikke fullføre import: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useInvoiceImport = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const uploadFile = useUploadFile();
  const importLines = useCreateInvoiceImport();

  const getImports = async () => {
    const { data, error } = await supabase
      .from('invoice_import')
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
