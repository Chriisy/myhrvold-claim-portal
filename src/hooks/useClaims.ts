
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ClaimFormData } from '@/lib/validations/claim';
import { useAuth } from '@/contexts/AuthContext';

export const useCreateClaim = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: ClaimFormData) => {
      if (!user) {
        throw new Error('Du må være logget inn for å opprette reklamasjoner');
      }

      const claimData = {
        customer_name: data.customer_name,
        customer_no: data.customer_no || null,
        department: data.department || null,
        machine_model: data.machine_model || null,
        machine_serial: data.machine_serial || null,
        warranty: data.warranty || false,
        quantity: data.quantity || null,
        category: data.category || null,
        supplier_id: data.supplier_id || null,
        description: data.description,
        visma_order_no: data.visma_order_no || null,
        customer_po: data.customer_po || null,
        reported_by: data.reported_by || null,
        internal_note: data.internal_note || null,
        created_by: user.id,
        status: 'Ny' as const,
        source: 'wizard'
      };

      const { data: claim, error } = await supabase
        .from('claims')
        .insert(claimData)
        .select('id')
        .single();

      if (error) {
        console.error('Error creating claim:', error);
        throw error;
      }

      return claim;
    },
    onSuccess: (claim) => {
      toast({
        title: 'Reklamasjon opprettet',
        description: 'Reklamasjonen har blitt opprettet og kan nå behandles.',
      });
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      navigate(`/claim/${claim.id}`);
    },
    onError: (error) => {
      console.error('Error creating claim:', error);
      toast({
        title: 'Feil ved opprettelse',
        description: 'Kunne ikke opprette reklamasjon. Prøv igjen.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateClaimStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ claimId, status }: { claimId: string; status: string }) => {
      const updateData: any = { status };
      
      // Hvis status er lukket, sett closed_at
      if (status === 'Lukket') {
        updateData.closed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('claims')
        .update(updateData)
        .eq('id', claimId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      toast({
        title: 'Status oppdatert',
        description: 'Reklamasjonsstatus har blitt oppdatert.',
      });
    },
    onError: (error) => {
      console.error('Error updating claim status:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke oppdatere status.',
        variant: 'destructive',
      });
    },
  });
};
