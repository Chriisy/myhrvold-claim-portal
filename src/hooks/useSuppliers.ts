
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { NewSupplierData } from '@/lib/validations/claim';
import { handleSupabaseError, withRetry } from '@/utils/supabaseErrorHandler';
import { toast } from '@/hooks/use-toast';

export const useSuppliers = () => {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      return withRetry(async () => {
        const { data, error } = await supabase
          .from('suppliers')
          .select('*')
          .is('deleted_at', null)
          .order('name');

        if (error) {
          handleSupabaseError(error, 'laste leverandører');
          throw error;
        }

        return data || [];
      });
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - suppliers don't change often
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (supplierData: NewSupplierData) => {
      return withRetry(async () => {
        // Verify authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          throw new Error('Du må være innlogget for å opprette leverandører');
        }

        const { data, error } = await supabase
          .from('suppliers')
          .insert({
            name: supplierData.name,
            contact_name: supplierData.contact_name || null,
            contact_phone: supplierData.contact_phone || null,
            contact_email: supplierData.contact_email || null,
          })
          .select()
          .single();

        if (error) {
          handleSupabaseError(error, 'opprette leverandør');
          throw error;
        }
        
        return data;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: 'Leverandør opprettet',
        description: 'Den nye leverandøren har blitt lagt til.',
      });
    },
    onError: (error: any) => {
      // Error already handled by handleSupabaseError, just log
      console.error('Error creating supplier:', error);
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: NewSupplierData }) => {
      return withRetry(async () => {
        const { data: supplier, error } = await supabase
          .from('suppliers')
          .update({
            name: data.name,
            contact_name: data.contact_name || null,
            contact_phone: data.contact_phone || null,
            contact_email: data.contact_email || null,
          })
          .eq('id', id)
          .is('deleted_at', null)
          .select()
          .single();

        if (error) {
          handleSupabaseError(error, 'oppdatere leverandør');
          throw error;
        }

        return supplier;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: 'Leverandør oppdatert',
        description: 'Leverandørinformasjonen har blitt oppdatert.',
      });
    },
    onError: (error: any) => {
      console.error('Error updating supplier:', error);
    },
  });
};

export const useArchiveSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return withRetry(async () => {
        const { data, error } = await supabase
          .from('suppliers')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', id)
          .is('deleted_at', null)
          .select()
          .single();

        if (error) {
          handleSupabaseError(error, 'arkivere leverandør');
          throw error;
        }

        return data;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: 'Leverandør arkivert',
        description: 'Leverandøren har blitt arkivert.',
      });
    },
    onError: (error: any) => {
      console.error('Error archiving supplier:', error);
    },
  });
};
