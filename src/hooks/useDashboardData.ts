
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, subDays } from 'date-fns';

interface DashboardFilters {
  supplier_id?: string;
  machine_model?: string;
  konto_nr?: number;
  technician_id?: string;
  date_range: {
    start: Date;
    end: Date;
  };
}

export const useDashboardKPIs = (filters: DashboardFilters) => {
  return useQuery({
    queryKey: ['dashboard-kpis', filters],
    queryFn: async () => {
      const today = new Date();
      const currentMonthStart = startOfMonth(today);
      const currentMonthEnd = endOfMonth(today);

      // Base query for claims
      let claimsQuery = supabase
        .from('claims')
        .select('id, status, due_date, closed_at, supplier_id, technician_id, machine_model')
        .gte('created_at', filters.date_range.start.toISOString())
        .lte('created_at', filters.date_range.end.toISOString());

      // Apply filters
      if (filters.supplier_id) {
        claimsQuery = claimsQuery.eq('supplier_id', filters.supplier_id);
      }
      if (filters.machine_model) {
        claimsQuery = claimsQuery.ilike('machine_model', `%${filters.machine_model}%`);
      }
      if (filters.technician_id) {
        claimsQuery = claimsQuery.eq('technician_id', filters.technician_id);
      }

      const { data: claims, error } = await claimsQuery;

      if (error) throw error;

      const newClaims = claims?.filter(claim => claim.status === 'Ny').length || 0;
      const openClaims = claims?.filter(claim => 
        ['Avventer', 'Godkjent'].includes(claim.status)
      ).length || 0;
      const overdueClaims = claims?.filter(claim => 
        claim.due_date && 
        new Date(claim.due_date) < today && 
        !['Bokført', 'Lukket'].includes(claim.status)
      ).length || 0;
      const closedThisMonth = claims?.filter(claim => 
        claim.closed_at &&
        new Date(claim.closed_at) >= currentMonthStart &&
        new Date(claim.closed_at) <= currentMonthEnd
      ).length || 0;

      return {
        newClaims,
        openClaims,
        overdueClaims,
        closedThisMonth
      };
    }
  });
};

export const useCostByAccount = (filters: DashboardFilters) => {
  return useQuery({
    queryKey: ['cost-by-account', filters],
    queryFn: async () => {
      let query = supabase
        .from('cost_line')
        .select(`
          amount,
          konto_nr,
          claim_id,
          claims!inner(
            supplier_id,
            technician_id,
            machine_model,
            created_at
          )
        `)
        .gte('claims.created_at', filters.date_range.start.toISOString())
        .lte('claims.created_at', filters.date_range.end.toISOString());

      if (filters.supplier_id) {
        query = query.eq('claims.supplier_id', filters.supplier_id);
      }
      if (filters.technician_id) {
        query = query.eq('claims.technician_id', filters.technician_id);
      }
      if (filters.machine_model) {
        query = query.ilike('claims.machine_model', `%${filters.machine_model}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Group by account number
      const accountTotals = data?.reduce((acc, line) => {
        const account = line.konto_nr || 0;
        acc[account] = (acc[account] || 0) + Number(line.amount);
        return acc;
      }, {} as Record<number, number>) || {};

      // Convert to array and sort by amount (top 5)
      return Object.entries(accountTotals)
        .map(([account, amount]) => ({
          account: Number(account),
          amount,
          description: `Konto ${account}` // Could be enhanced with actual account descriptions
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);
    }
  });
};

export const useSupplierDistribution = (filters: DashboardFilters) => {
  return useQuery({
    queryKey: ['supplier-distribution', filters],
    queryFn: async () => {
      let query = supabase
        .from('cost_line')
        .select(`
          amount,
          claims!inner(
            supplier_id,
            technician_id,
            machine_model,
            created_at,
            suppliers(name)
          )
        `)
        .gte('claims.created_at', filters.date_range.start.toISOString())
        .lte('claims.created_at', filters.date_range.end.toISOString());

      if (filters.supplier_id) {
        query = query.eq('claims.supplier_id', filters.supplier_id);
      }
      if (filters.technician_id) {
        query = query.eq('claims.technician_id', filters.technician_id);
      }
      if (filters.machine_model) {
        query = query.ilike('claims.machine_model', `%${filters.machine_model}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Group by supplier
      const supplierTotals = data?.reduce((acc, line) => {
        const supplierName = line.claims?.suppliers?.name || 'Ukjent';
        acc[supplierName] = (acc[supplierName] || 0) + Number(line.amount);
        return acc;
      }, {} as Record<string, number>) || {};

      const total = Object.values(supplierTotals).reduce((sum, amount) => sum + amount, 0);

      return Object.entries(supplierTotals)
        .map(([name, amount]) => ({
          name,
          value: Math.round((amount / total) * 100),
          amount,
          color: getSupplierColor(name)
        }))
        .sort((a, b) => b.amount - a.amount);
    }
  });
};

export const useRecentClaims = (filters: DashboardFilters) => {
  return useQuery({
    queryKey: ['recent-claims', filters],
    queryFn: async () => {
      let query = supabase
        .from('claims')
        .select(`
          id,
          created_at,
          customer_name,
          machine_model,
          status,
          supplier_id,
          technician_id,
          suppliers(name),
          users(name)
        `)
        .gte('created_at', filters.date_range.start.toISOString())
        .lte('created_at', filters.date_range.end.toISOString())
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

      const { data: claims, error } = await query;

      if (error) throw error;

      // Get cost totals for each claim
      const claimIds = claims?.map(claim => claim.id) || [];
      
      if (claimIds.length === 0) return [];

      const { data: costLines } = await supabase
        .from('cost_line')
        .select('claim_id, amount')
        .in('claim_id', claimIds);

      const { data: creditNotes } = await supabase
        .from('credit_note')
        .select('claim_id, amount')
        .in('claim_id', claimIds);

      // Calculate totals
      const costTotals = costLines?.reduce((acc, line) => {
        acc[line.claim_id] = (acc[line.claim_id] || 0) + Number(line.amount);
        return acc;
      }, {} as Record<string, number>) || {};

      const creditTotals = creditNotes?.reduce((acc, note) => {
        acc[note.claim_id] = (acc[note.claim_id] || 0) + Number(note.amount);
        return acc;
      }, {} as Record<string, number>) || {};

      return claims?.map(claim => ({
        ...claim,
        totalCost: (costTotals[claim.id] || 0) - (creditTotals[claim.id] || 0)
      })) || [];
    }
  });
};

// Helper function to assign colors to suppliers
const getSupplierColor = (supplierName: string) => {
  const colors = ['#223368', '#4050a1', '#6366f1', '#8b5cf6', '#a855f7'];
  const hash = supplierName.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  return colors[Math.abs(hash) % colors.length];
};
