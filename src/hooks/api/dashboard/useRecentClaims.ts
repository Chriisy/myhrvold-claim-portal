
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryKeys';
import { DashboardFilters } from '@/types/dashboard';

export const useRecentClaims = (filters: DashboardFilters) => {
  return useQuery({
    queryKey: queryKeys.dashboard.recentClaims(filters),
    queryFn: async () => {
      let query = supabase
        .from('claims')
        .select(`
          id,
          display_id,
          created_at,
          customer_name,
          machine_model,
          part_number,
          status,
          supplier_id,
          technician_id,
          suppliers(name),
          technician:users!claims_technician_id_fkey(name)
        `)
        .gte('created_at', filters.date_range.start.toISOString())
        .lte('created_at', filters.date_range.end.toISOString())
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(5);

      if (filters.supplier_id) {
        query = query.eq('supplier_id', filters.supplier_id);
      }
      if (filters.technician_id) {
        query = query.eq('technician_id', filters.technician_id);
      }
      if (filters.machine_model) {
        query = query.ilike('machine_model', `%${filters.machine_model}%`);
      }
      if (filters.part_number) {
        query = query.ilike('part_number', `%${filters.part_number}%`);
      }

      const { data: claims, error } = await query;

      if (error) throw error;

      // Get cost totals for each claim in batches to optimize queries
      const claimIds = claims?.map(claim => claim.id) || [];
      
      if (claimIds.length === 0) return [];

      // Batch query for all cost lines and credit notes
      const [costResult, creditResult] = await Promise.all([
        supabase
          .from('cost_line')
          .select('claim_id, amount')
          .in('claim_id', claimIds),
        supabase
          .from('credit_note')
          .select('claim_id, amount')
          .in('claim_id', claimIds)
      ]);

      // Calculate totals efficiently
      const costTotals = costResult.data?.reduce((acc, line) => {
        acc[line.claim_id] = (acc[line.claim_id] || 0) + Number(line.amount);
        return acc;
      }, {} as Record<string, number>) || {};

      const creditTotals = creditResult.data?.reduce((acc, note) => {
        acc[note.claim_id] = (acc[note.claim_id] || 0) + Number(note.amount);
        return acc;
      }, {} as Record<string, number>) || {};

      return claims?.map(claim => ({
        ...claim,
        totalCost: (costTotals[claim.id] || 0) - (creditTotals[claim.id] || 0)
      })) || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
