
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ErrorService } from '@/services/errorHandling/errorService';
import { ClaimCategory, ClaimStatus } from '@/types/claim';

interface ClaimWithRelations {
  id: string;
  customer_name?: string;
  customer_no?: string;
  customer_address?: string;
  department?: string;
  machine_model?: string;
  machine_serial?: string;
  part_number?: string;
  warranty?: boolean;
  quantity?: number;
  category?: ClaimCategory | null;
  status?: ClaimStatus;
  created_at: string;
  created_by?: string;
  suppliers?: { name: string } | null;
  technician?: { name: string } | null;
  salesperson?: { name: string } | null;
  account_codes?: {
    konto_nr: number;
    type: string;
    seller_flag: boolean;
    comment: string;
  } | null;
}

interface PaginatedResult {
  data: ClaimWithRelations[];
  count: number;
  totalPages: number;
}

interface ClaimsQueryFilters {
  searchTerm?: string;
  statusFilter?: string;
  categoryFilter?: string;
  partNumberFilter?: string;
  page?: number;
  pageSize?: number;
}

// Helper function to check if a string is a valid ClaimStatus
const isValidClaimStatus = (status: string): status is ClaimStatus => {
  const validStatuses: ClaimStatus[] = ['Ny', 'Avventer', 'Godkjent', 'Avslått', 'Bokført', 'Lukket', 'Venter på svar'];
  return validStatuses.includes(status as ClaimStatus);
};

// Helper function to check if a string is a valid ClaimCategory
const isValidClaimCategory = (category: string): category is ClaimCategory => {
  const validCategories: ClaimCategory[] = ['Service', 'Installasjon', 'Produkt', 'Del'];
  return validCategories.includes(category as ClaimCategory);
};

export const useClaimsQuery = (filters: ClaimsQueryFilters = {}) => {
  const {
    searchTerm = '',
    statusFilter = 'Alle',
    categoryFilter = 'Alle',
    partNumberFilter = '',
    page = 1,
    pageSize = 50
  } = filters;

  return useQuery({
    queryKey: ['claims', { searchTerm, statusFilter, categoryFilter, partNumberFilter, page, pageSize }],
    queryFn: async (): Promise<PaginatedResult> => {
      return ErrorService.withRetry(async () => {
        let query = supabase
          .from('claims')
          .select(`
            *,
            suppliers(name),
            technician:users!claims_technician_id_fkey(name),
            salesperson:users!claims_salesperson_id_fkey(name),
            account_codes(konto_nr, type, seller_flag, comment)
          `, { count: 'exact' })
          .is('deleted_at', null);

        // Apply filters
        if (searchTerm) {
          query = query.or(`customer_name.ilike.%${searchTerm}%,id.ilike.%${searchTerm}%,machine_model.ilike.%${searchTerm}%,customer_address.ilike.%${searchTerm}%`);
        }

        if (statusFilter !== 'Alle' && isValidClaimStatus(statusFilter)) {
          query = query.eq('status', statusFilter);
        }

        if (categoryFilter !== 'Alle' && isValidClaimCategory(categoryFilter)) {
          query = query.eq('category', categoryFilter);
        }

        if (partNumberFilter) {
          query = query.ilike('part_number', `%${partNumberFilter}%`);
        }

        // Add pagination
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data, error, count } = await query
          .order('created_at', { ascending: false })
          .range(from, to);

        if (error) {
          console.error('Supabase error in useClaimsQuery:', error);
          ErrorService.handleSupabaseError(error, 'laste reklamasjoner');
          throw new Error(`Failed to fetch claims: ${error.message}`);
        }

        const totalPages = Math.ceil((count || 0) / pageSize);

        return {
          data: (data || []) as ClaimWithRelations[],
          count: count || 0,
          totalPages
        };
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      if (error.message?.includes('permission') || error.message?.includes('unauthorized')) {
        return false;
      }
      return ErrorService.shouldRetryQuery(failureCount, error);
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};

export const useClaimQuery = (claimId: string) => {
  return useQuery({
    queryKey: ['claim', claimId],
    queryFn: async (): Promise<ClaimWithRelations | null> => {
      if (!claimId) {
        console.warn('No claim ID provided to useClaimQuery');
        return null;
      }
      
      return ErrorService.withRetry(async () => {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(claimId);
        
        if (!isUUID) {
          console.warn('Invalid UUID format provided to useClaimQuery:', claimId);
          return null;
        }

        const { data, error } = await supabase
          .from('claims')
          .select(`
            *,
            suppliers(name),
            technician:users!claims_technician_id_fkey(name),
            salesperson:users!claims_salesperson_id_fkey(name),
            account_codes(konto_nr, type, seller_flag, comment)
          `)
          .eq('id', claimId)
          .is('deleted_at', null)
          .maybeSingle();

        if (error) {
          console.error('Supabase error in useClaimQuery:', error);
          ErrorService.handleSupabaseError(error, 'laste reklamasjon');
          throw new Error(`Failed to fetch claim: ${error.message}`);
        }

        return data as ClaimWithRelations | null;
      });
    },
    enabled: !!claimId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error) => {
      if (error.message?.includes('permission') || error.message?.includes('unauthorized')) {
        return false;
      }
      return failureCount < 2;
    },
  });
};
