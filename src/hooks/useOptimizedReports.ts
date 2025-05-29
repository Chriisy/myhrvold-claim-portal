
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ErrorService } from '@/services/errorHandling/errorService';

interface ReportFilters {
  date_range: {
    start: Date;
    end: Date;
  };
  report_type: 'claims' | 'costs' | 'suppliers' | 'technicians';
}

export const useOptimizedReports = (filters: ReportFilters) => {
  return useQuery({
    queryKey: ['reports', filters],
    queryFn: async () => {
      try {
        switch (filters.report_type) {
          case 'claims':
            return await generateClaimsReport(filters.date_range);
          case 'costs':
            return await generateCostsReport(filters.date_range);
          case 'suppliers':
            return await generateSuppliersReport(filters.date_range);
          case 'technicians':
            return await generateTechniciansReport(filters.date_range);
          default:
            throw new Error('Ukjent rapporttype');
        }
      } catch (error) {
        ErrorService.handleSupabaseError(error as any, 'generere rapport', {
          component: 'useOptimizedReports',
          severity: 'medium'
        });
        throw error;
      }
    },
    enabled: !!filters.report_type,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => ErrorService.shouldRetryQuery(failureCount, error),
  });
};

const generateClaimsReport = async (dateRange: { start: Date; end: Date }) => {
  const { data, error } = await supabase
    .from('claims')
    .select(`
      *,
      suppliers(name),
      technician:users!technician_id(name),
      cost_line(amount)
    `)
    .gte('created_at', dateRange.start.toISOString())
    .lte('created_at', dateRange.end.toISOString())
    .is('deleted_at', null);

  if (error) throw error;
  return data;
};

const generateCostsReport = async (dateRange: { start: Date; end: Date }) => {
  const { data, error } = await supabase
    .from('cost_line')
    .select(`
      *,
      claims!inner(
        customer_name,
        machine_model,
        suppliers(name)
      )
    `)
    .gte('date', dateRange.start.toISOString().split('T')[0])
    .lte('date', dateRange.end.toISOString().split('T')[0]);

  if (error) throw error;
  return data;
};

const generateSuppliersReport = async (dateRange: { start: Date; end: Date }) => {
  const { data, error } = await supabase
    .from('suppliers')
    .select(`
      *,
      claims!supplier_id(
        id,
        status,
        created_at,
        cost_line(amount)
      )
    `)
    .is('deleted_at', null);

  if (error) throw error;
  return data;
};

const generateTechniciansReport = async (dateRange: { start: Date; end: Date }) => {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      claims!technician_id(
        id,
        status,
        created_at,
        cost_line(amount)
      )
    `)
    .eq('user_role', 'tekniker');

  if (error) throw error;
  return data;
};
