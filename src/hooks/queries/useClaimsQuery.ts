
import { useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ClaimCategory, ClaimStatus } from '@/types/claim';
import { useUnifiedQuery } from './useUnifiedQuery';

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

const isValidClaimStatus = (status: string): status is ClaimStatus => {
  const validStatuses: ClaimStatus[] = ['Ny', 'Avventer', 'Godkjent', 'Avslått', 'Bokført', 'Lukket', 'Venter på svar'];
  return validStatuses.includes(status as ClaimStatus);
};

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

  const queryFn = useCallback(async (): Promise<PaginatedResult> => {
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

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    const totalPages = Math.ceil((count || 0) / pageSize);

    return {
      data: (data || []) as ClaimWithRelations[],
      count: count || 0,
      totalPages
    };
  }, [searchTerm, statusFilter, categoryFilter, partNumberFilter, page, pageSize]);

  const queryKey = useMemo(() => [
    'claims', 
    { searchTerm, statusFilter, categoryFilter, partNumberFilter, page, pageSize }
  ], [searchTerm, statusFilter, categoryFilter, partNumberFilter, page, pageSize]);

  return useUnifiedQuery(queryKey, queryFn, {
    errorContext: 'laste reklamasjoner'
  });
};

export const useClaimQuery = (claimId: string) => {
  const queryFn = useCallback(async (): Promise<ClaimWithRelations | null> => {
    if (!claimId) return null;
    
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(claimId);
    if (!isUUID) return null;

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

    if (error) throw error;
    return data as ClaimWithRelations | null;
  }, [claimId]);

  return useUnifiedQuery(['claim', claimId], queryFn, {
    enabled: !!claimId,
    errorContext: 'laste reklamasjon'
  });
};
