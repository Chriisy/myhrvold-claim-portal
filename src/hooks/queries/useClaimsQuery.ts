
import { useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ClaimCategory, ClaimStatus } from '@/types/claim';
import { useUnifiedQuery } from './useUnifiedQuery';

interface ClaimWithRelations {
  id: string;
  display_id?: string;
  customer_name?: string;
  customer_no?: string;
  customer_address?: string;
  customer_postal_code?: string;
  customer_city?: string;
  department?: string;
  machine_model?: string;
  machine_serial?: string;
  part_number?: string;
  warranty?: boolean;
  quantity?: number;
  category?: ClaimCategory | null;
  status?: ClaimStatus;
  description?: string;
  visma_order_no?: string;
  customer_po?: string;
  reported_by?: string;
  internal_note?: string;
  root_cause?: string;
  corrective_action?: string;
  preventive_action?: string;
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
      // Fix: Remove line breaks and format properly for Supabase
      query = query.or(`customer_name.ilike.%${searchTerm}%,display_id.ilike.%${searchTerm}%,machine_model.ilike.%${searchTerm}%,customer_address.ilike.%${searchTerm}%`);
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
    const isDisplayId = /^#\d{4}-\d{1,2}-\d+$/.test(claimId);
    
    if (!isUUID && !isDisplayId) return null;

    let query = supabase
      .from('claims')
      .select(`
        *,
        suppliers(name),
        technician:users!claims_technician_id_fkey(name),
        salesperson:users!claims_salesperson_id_fkey(name),
        account_codes(konto_nr, type, seller_flag, comment)
      `)
      .is('deleted_at', null);

    if (isDisplayId) {
      query = query.eq('display_id', claimId);
    } else {
      query = query.eq('id', claimId);
    }

    const { data, error } = await query.maybeSingle();

    if (error) throw error;
    return data as ClaimWithRelations | null;
  }, [claimId]);

  return useUnifiedQuery(['claim', claimId], queryFn, {
    enabled: !!claimId,
    errorContext: 'laste reklamasjon'
  });
};
