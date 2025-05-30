
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface OptimizedSupplier {
  id: string;
  name: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  created_at: string;
  claims_count?: number;
  total_cost?: number;
}

export const useOptimizedSuppliers = () => {
  return useQuery({
    queryKey: ['optimized-suppliers'],
    queryFn: async (): Promise<OptimizedSupplier[]> => {
      try {
        const { data: suppliers, error } = await supabase
          .from('suppliers')
          .select(`
            id,
            name,
            contact_name,
            contact_email,
            contact_phone,
            created_at
          `)
          .is('deleted_at', null)
          .order('name');

        if (error) {
          console.error('Error fetching suppliers:', error);
          throw error;
        }

        // TODO: Add claims count and total cost aggregation
        return (suppliers || []).map(supplier => ({
          ...supplier,
          claims_count: 0,
          total_cost: 0
        }));
      } catch (error) {
        console.error('Error in useOptimizedSuppliers:', error);
        throw error;
      }
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
  });
};
