import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ErrorService } from '@/services/errorHandling/errorService';

interface ClaimsFilters {
  status?: string;
  supplier_id?: string;
  date_range?: {
    start: Date;
    end: Date;
  };
  search?: string;
}

type ClaimStatus = "Ny" | "Avventer" | "Godkjent" | "Avslått" | "Bokført" | "Lukket" | "Venter på svar";

const isValidClaimStatus = (status: string): status is ClaimStatus => {
  return ["Ny", "Avventer", "Godkjent", "Avslått", "Bokført", "Lukket", "Venter på svar"].includes(status);
};

export const useOptimizedClaims = (filters: ClaimsFilters = {}) => {
  return useQuery({
    queryKey: ['claims', filters],
    queryFn: async () => {
      try {
        let query = supabase
          .from('claims')
          .select(`
            *,
            suppliers(name),
            technician:users!technician_id(name),
            cost_line(amount)
          `)
          .is('deleted_at', null)
          .order('created_at', { ascending: false });

        if (filters.status && filters.status !== 'all' && isValidClaimStatus(filters.status)) {
          query = query.eq('status', filters.status);
        }

        if (filters.supplier_id) {
          query = query.eq('supplier_id', filters.supplier_id);
        }

        if (filters.date_range) {
          query = query
            .gte('created_at', filters.date_range.start.toISOString())
            .lte('created_at', filters.date_range.end.toISOString());
        }

        if (filters.search) {
          query = query.or(`customer_name.ilike.%${filters.search}%,display_id.ilike.%${filters.search}%,machine_model.ilike.%${filters.search}%,part_number.ilike.%${filters.search}%`);
        }

        const { data, error } = await query;
        if (error) throw error;

        return data?.map(claim => ({
          ...claim,
          totalCost: claim.cost_line?.reduce((sum: number, cost: any) => sum + Number(cost.amount), 0) || 0
        })) || [];
      } catch (error) {
        ErrorService.handleSupabaseError(error as any, 'laste reklamasjoner', {
          component: 'useOptimizedClaims',
          severity: 'high'
        });
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error) => ErrorService.shouldRetryQuery(failureCount, error),
  });
};

export const useCreateClaim = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (claimData: any) => {
      try {
        const { data, error } = await supabase
          .from('claims')
          .insert([claimData])
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        ErrorService.handleSupabaseError(error as any, 'opprette reklamasjon', {
          component: 'useCreateClaim',
          severity: 'high'
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      toast({
        title: "Reklamasjon opprettet",
        description: "Reklamasjonen er lagret i systemet",
      });
    },
    onError: (error) => {
      console.error('Create claim error:', error);
      toast({
        title: "Feil",
        description: "Kunne ikke opprette reklamasjon",
        variant: "destructive"
      });
    }
  });
};
