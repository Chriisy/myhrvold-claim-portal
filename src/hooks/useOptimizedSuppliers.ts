
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ErrorService } from '@/services/errorHandling/errorService';

export const useOptimizedSuppliers = () => {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('suppliers')
          .select('*')
          .is('deleted_at', null)
          .order('name');

        if (error) throw error;
        return data || [];
      } catch (error) {
        ErrorService.handleSupabaseError(error as any, 'laste leverandører', {
          component: 'useOptimizedSuppliers',
          severity: 'high'
        });
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => ErrorService.shouldRetryQuery(failureCount, error),
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (supplierData: any) => {
      try {
        const { data, error } = await supabase
          .from('suppliers')
          .insert([supplierData])
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        ErrorService.handleSupabaseError(error as any, 'opprette leverandør', {
          component: 'useCreateSupplier',
          severity: 'medium'
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: "Leverandør opprettet",
        description: "Leverandøren er lagt til i systemet",
      });
    },
    onError: (error) => {
      console.error('Create supplier error:', error);
      toast({
        title: "Feil",
        description: "Kunne ikke opprette leverandør",
        variant: "destructive"
      });
    }
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      try {
        const { data, error } = await supabase
          .from('suppliers')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        ErrorService.handleSupabaseError(error as any, 'oppdatere leverandør', {
          component: 'useUpdateSupplier',
          severity: 'medium'
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: "Leverandør oppdatert",
        description: "Endringene er lagret",
      });
    },
    onError: (error) => {
      console.error('Update supplier error:', error);
      toast({
        title: "Feil",
        description: "Kunne ikke oppdatere leverandør",
        variant: "destructive"
      });
    }
  });
};
