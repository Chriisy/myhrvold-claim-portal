
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from '@/hooks/use-toast';
import { ClaimFormData } from '@/lib/validations/claim';

export const useOptimizedCreateClaim = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ClaimFormData & { files?: File[] }) => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Separate files from claim data
      const { files, ...claimData } = data;

      const { data: claim, error } = await supabase
        .from('claims')
        .insert([{
          ...claimData,
          created_by: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      // Handle file uploads if any
      if (files && files.length > 0) {
        await Promise.all(
          files.map(async (file) => {
            const fileExt = file.name.split('.').pop();
            const fileName = `${claim.id}/${Date.now()}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
              .from('claim-files')
              .upload(fileName, file);

            if (uploadError) throw uploadError;

            // Create file record
            await supabase
              .from('claim_files')
              .insert({
                claim_id: claim.id,
                file_name: file.name,
                file_path: fileName,
                file_type: file.type,
                file_size: file.size,
                file_url: `claim-files/${fileName}`
              });
          })
        );
      }

      return claim;
    },
    onMutate: async (newClaim) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.claims.all });

      // Snapshot previous value
      const previousClaims = queryClient.getQueryData(queryKeys.claims.all);

      // Optimistically update to new value
      const optimisticClaim = {
        id: `temp-${Date.now()}`,
        ...newClaim,
        status: 'Ny' as const,
        created_at: new Date().toISOString(),
        files: undefined
      };

      queryClient.setQueryData(queryKeys.claims.all, (old: any) => {
        if (!old) return [optimisticClaim];
        return [optimisticClaim, ...old];
      });

      return { previousClaims };
    },
    onError: (err, newClaim, context) => {
      // Rollback optimistic update
      queryClient.setQueryData(queryKeys.claims.all, context?.previousClaims);
      toast({
        title: "Feil ved opprettelse",
        description: "Kunne ikke opprette reklamasjon. Prøv igjen.",
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      // Invalidate and refetch specific queries
      queryClient.invalidateQueries({ queryKey: queryKeys.claims.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.kpis() });
      
      toast({
        title: "Reklamasjon opprettet",
        description: "Reklamasjonen ble opprettet og du blir videresendt.",
      });
      
      // Navigate to the new claim - Fixed: added data parameter
      setTimeout(() => {
        window.location.href = `/claims/${data.id}`;
      }, 1000);
    },
  });
};

export const useOptimizedUpdateClaim = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ClaimFormData> }) => {
      const { data, error } = await supabase
        .from('claims')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.claims.detail(id) });

      // Snapshot previous value
      const previousClaim = queryClient.getQueryData(queryKeys.claims.detail(id));

      // Optimistically update
      queryClient.setQueryData(queryKeys.claims.detail(id), (old: any) => {
        if (!old) return old;
        return { ...old, ...updates };
      });

      return { previousClaim };
    },
    onError: (err, { id }, context) => {
      // Rollback
      queryClient.setQueryData(queryKeys.claims.detail(id), context?.previousClaim);
      toast({
        title: "Feil ved oppdatering",
        description: "Kunne ikke oppdatere reklamasjon. Prøv igjen.",
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      // Update related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.claims.all });
      queryClient.setQueryData(queryKeys.claims.detail(data.id), data);
      
      toast({
        title: "Oppdatert",
        description: "Reklamasjonen ble oppdatert.",
      });
    },
  });
};
