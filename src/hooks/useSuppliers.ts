
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { NewSupplierData } from '@/lib/validations/claim';

export interface Supplier {
  id: string;
  name: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  created_at?: string;
  deleted_at?: string;
}

export const useSuppliers = () => {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .is('deleted_at', null)
        .order('name');

      if (error) {
        console.error('Error fetching suppliers:', error);
        throw error;
      }

      return data as Supplier[];
    },
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: NewSupplierData) => {
      const { data: supplier, error } = await supabase
        .from('suppliers')
        .insert({
          name: data.name,
          contact_name: data.contact_name || null,
          contact_phone: data.contact_phone || null,
          contact_email: data.contact_email || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating supplier:', error);
        throw error;
      }

      return supplier;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: 'Leverandør opprettet',
        description: 'Ny leverandør har blitt lagt til.',
      });
    },
    onError: (error) => {
      console.error('Error creating supplier:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke opprette leverandør.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<NewSupplierData> }) => {
      const { data: supplier, error } = await supabase
        .from('suppliers')
        .update({
          name: data.name,
          contact_name: data.contact_name || null,
          contact_phone: data.contact_phone || null,
          contact_email: data.contact_email || null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating supplier:', error);
        throw error;
      }

      return supplier;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: 'Leverandør oppdatert',
        description: 'Leverandørinformasjon har blitt oppdatert.',
      });
    },
    onError: (error) => {
      console.error('Error updating supplier:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke oppdatere leverandør.',
        variant: 'destructive',
      });
    },
  });
};

export const useArchiveSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('suppliers')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Error archiving supplier:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: 'Leverandør arkivert',
        description: 'Leverandøren har blitt arkivert.',
      });
    },
    onError: (error) => {
      console.error('Error archiving supplier:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke arkivere leverandør.',
        variant: 'destructive',
      });
    },
  });
};

// Alias for backward compatibility
export const useDeleteSupplier = useArchiveSupplier;
