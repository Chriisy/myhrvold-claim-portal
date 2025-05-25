
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ErrorService } from '@/services/errorHandling/errorService';
import { useToast } from '@/hooks/use-toast';

export function useClaimCosts(claimIdOrNumber: string) {
  return useQuery({
    queryKey: ['costs', claimIdOrNumber],
    queryFn: async () => {
      return ErrorService.withRetry(async () => {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(claimIdOrNumber);
        
        let actualClaimId = claimIdOrNumber;
        
        if (!isUUID) {
          const { data: claimData, error: claimError } = await supabase
            .from('claims')
            .select('id')
            .is('deleted_at', null)
            .eq('id', claimIdOrNumber)
            .maybeSingle();
            
          if (claimError) {
            ErrorService.handleSupabaseError(claimError, 'finne reklamasjon');
            return [];
          }
          
          if (!claimData) {
            console.warn('Could not find claim with identifier:', claimIdOrNumber);
            return [];
          }
          
          actualClaimId = claimData.id;
        }
        
        const { data, error } = await supabase
          .from('cost_line')
          .select('*')
          .eq('claim_id', actualClaimId)
          .order('created_at', { ascending: true });
        
        if (error) {
          ErrorService.handleSupabaseError(error, 'laste kostnader');
          throw error;
        }
        
        return data || [];
      });
    },
    enabled: !!claimIdOrNumber,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useAddCostLine() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      claim_id: string;
      description: string;
      amount: number;
      konto_nr?: number;
    }) => {
      return ErrorService.withRetry(async () => {
        const { data: result, error } = await supabase
          .from('cost_line')
          .insert({
            claim_id: data.claim_id,
            description: data.description,
            amount: data.amount,
            konto_nr: data.konto_nr || null,
          })
          .select()
          .single();
        
        if (error) {
          ErrorService.handleSupabaseError(error, 'legge til kostnad');
          throw error;
        }
        
        return result;
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['costs', variables.claim_id] });
      toast({
        title: "Kostnad lagt til",
        description: "Kostnaden har blitt registrert.",
      });
    },
    onError: (error) => {
      console.error('Error adding cost line:', error);
    }
  });
}
