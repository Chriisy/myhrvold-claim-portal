
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface OptimizedClaim {
  id: string;
  display_id: string;
  customer_name: string;
  status: string;
  category: string;
  created_at: string;
  supplier_name?: string;
  technician_name?: string;
  total_cost?: number;
}

export const useOptimizedClaims = () => {
  return useQuery({
    queryKey: ['optimized-claims'],
    queryFn: async (): Promise<OptimizedClaim[]> => {
      const { data, error } = await supabase
        .from('claims')
        .select(`
          id,
          display_id,
          customer_name,
          status,
          category,
          created_at,
          suppliers(name),
          technician:users!claims_technician_id_fkey(name)
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching optimized claims:', error);
        throw error;
      }

      return (data || []).map(claim => ({
        id: claim.id,
        display_id: claim.display_id || '',
        customer_name: claim.customer_name || '',
        status: claim.status,
        category: claim.category || '',
        created_at: claim.created_at,
        supplier_name: (claim.suppliers as any)?.name,
        technician_name: (claim.technician as any)?.name,
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};
