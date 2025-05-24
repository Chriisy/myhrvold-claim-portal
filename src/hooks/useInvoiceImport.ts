
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ParsedInvoiceLine, MappedInvoiceLine } from '@/types/invoice';

export const useCreateInvoiceImport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      file_id: string;
      filename: string;
      lines: ParsedInvoiceLine[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: importRecord, error } = await supabase
        .from('invoice_import')
        .insert({
          file_id: data.file_id,
          meta_json: {
            filename: data.filename,
            uploaded_at: new Date().toISOString(),
            lines: data.lines,
          },
          status: 'validating',
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return importRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice-imports'] });
    },
    onError: (error) => {
      console.error('Error creating invoice import:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke opprette import. Prøv igjen.',
        variant: 'destructive',
      });
    },
  });
};

export const useProcessImport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      importId: string;
      mappedLines: MappedInvoiceLine[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Process each mapped line
      const results = await Promise.all(
        data.mappedLines.map(async (line) => {
          if (line.type === 'cost') {
            // Insert into cost_line
            const { data: costLine, error } = await supabase
              .from('cost_line')
              .insert({
                claim_id: line.claim_id!,
                description: line.note || line.description,
                amount: line.amount,
                konto_nr: line.konto,
                voucher_no: line.voucher,
                source: 'invoice-import',
              })
              .select()
              .single();

            if (error) throw error;

            // Add timeline item
            await supabase.from('timeline_item').insert({
              claim_id: line.claim_id!,
              message: `Imported cost line from invoice: ${line.description}, amount ${line.amount}`,
              created_by: user.id,
            });

            return { type: 'cost', data: costLine };
          } else {
            // Insert into credit_note
            const { data: creditNote, error } = await supabase
              .from('credit_note')
              .insert({
                claim_id: line.claim_id!,
                description: line.note || line.description,
                amount: line.amount,
                konto_nr: line.konto,
                voucher_no: line.voucher,
                source: 'invoice-import',
              })
              .select()
              .single();

            if (error) throw error;

            // Add timeline item
            await supabase.from('timeline_item').insert({
              claim_id: line.claim_id!,
              message: `Imported credit note from invoice: ${line.description}, amount ${line.amount}`,
              created_by: user.id,
            });

            return { type: 'credit', data: creditNote };
          }
        })
      );

      // Update import status
      const { error: updateError } = await supabase
        .from('invoice_import')
        .update({ 
          status: 'ready',
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.importId);

      if (updateError) throw updateError;

      return results;
    },
    onSuccess: (results) => {
      const costLines = results.filter(r => r.type === 'cost').length;
      const creditNotes = results.filter(r => r.type === 'credit').length;
      
      queryClient.invalidateQueries({ queryKey: ['invoice-imports'] });
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      
      toast({
        title: 'Import fullført',
        description: `Lagt til ${costLines} kostnadslinjer og ${creditNotes} kreditnotaer.`,
      });
    },
    onError: (error) => {
      console.error('Error processing import:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke fullføre import. Prøv igjen.',
        variant: 'destructive',
      });
    },
  });
};

export const useUploadFile = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('invoices')
        .upload(fileName, file);

      if (error) throw error;
      return { file_id: data.path, filename: file.name };
    },
    onError: (error) => {
      console.error('Error uploading file:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke laste opp fil. Prøv igjen.',
        variant: 'destructive',
      });
    },
  });
};
