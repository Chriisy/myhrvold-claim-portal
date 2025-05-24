
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { NewSupplierData } from '@/lib/validations/claim';
import { toast } from '@/hooks/use-toast';

export const useSuppliers = () => {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .is('deleted_at', null)
        .order('name');

      if (error) throw error;
      return data;
    },
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (supplierData: NewSupplierData) => {
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Authentication error:', authError);
        throw new Error('Du må være innlogget for å opprette leverandører');
      }

      console.log('Creating supplier with data:', supplierData);
      console.log('Authenticated user:', user.id);

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
        console.error('Supplier creation error:', error);
        throw error;
      }
      
      console.log('Supplier created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: 'Leverandør opprettet',
        description: 'Den nye leverandøren har blitt lagt til.',
      });
    },
    onError: (error: any) => {
      console.error('Error creating supplier:', error);
      
      let errorMessage = 'Kunne ikke opprette leverandør. Prøv igjen.';
      
      if (error.message === 'Du må være innlogget for å opprette leverandører') {
        errorMessage = error.message;
      } else if (error.code === '42501') {
        errorMessage = 'Du har ikke tilgang til å opprette leverandører. Kontakt administrator.';
      }
      
      toast({
        title: 'Feil',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: NewSupplierData }) => {
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
        console.error('Supplier update error:', error);
        throw error;
      }

      return supplier;
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
      toast({
        title: 'Feil',
        description: 'Kunne ikke oppdatere leverandør. Prøv igjen.',
        variant: 'destructive',
      });
    },
  });
};

export const useArchiveSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('suppliers')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supplier archive error:', error);
        throw error;
      }

      return data;
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
      toast({
        title: 'Feil',
        description: 'Kunne ikke arkivere leverandør. Prøv igjen.',
        variant: 'destructive',
      });
    },
  });
};
