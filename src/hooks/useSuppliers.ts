
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
