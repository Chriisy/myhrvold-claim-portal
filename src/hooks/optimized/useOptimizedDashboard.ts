
import { useMemo } from 'react';
import { useDashboardFilters } from '@/contexts/DashboardFiltersContext';
import { useQueryDeduplication } from '../performance/useQueryDeduplication';
import { useDashboardKPIs } from '../api/dashboard/useDashboardKPIs';
import { useStackedBarData } from '../api/dashboard/useStackedBarData';
import { useSupplierDistribution } from '../api/dashboard/useSupplierDistribution';
import { useRootCauseData } from '../api/dashboard/useRootCauseData';
import { useRecentClaims } from '../api/dashboard/useRecentClaims';

export const useOptimizedDashboard = () => {
  const { filters } = useDashboardFilters();
  const { prefetchQuery } = useQueryDeduplication();

  // Main dashboard queries with improved caching
  const kpisQuery = useDashboardKPIs(filters);
  const stackedBarQuery = useStackedBarData(filters);
  const supplierQuery = useSupplierDistribution(filters);
  const rootCauseQuery = useRootCauseData(filters);
  const recentClaimsQuery = useRecentClaims(filters);

  // Prefetch related data when filters change
  const prefetchRelatedData = useMemo(() => {
    return () => {
      // Prefetch supplier data if not already loaded
      if (filters.supplier_id) {
        prefetchQuery(
          ['supplier', filters.supplier_id],
          () => fetch(`/api/suppliers/${filters.supplier_id}`).then(r => r.json())
        );
      }

      // Prefetch technician data
      if (filters.technician_id) {
        prefetchQuery(
          ['technician', filters.technician_id], 
          () => fetch(`/api/technicians/${filters.technician_id}`).then(r => r.json())
        );
      }
    };
  }, [filters, prefetchQuery]);

  // Combined loading state
  const isLoading = useMemo(() => {
    return kpisQuery.isLoading || 
           stackedBarQuery.isLoading || 
           supplierQuery.isLoading || 
           rootCauseQuery.isLoading || 
           recentClaimsQuery.isLoading;
  }, [
    kpisQuery.isLoading,
    stackedBarQuery.isLoading,
    supplierQuery.isLoading,
    rootCauseQuery.isLoading,
    recentClaimsQuery.isLoading
  ]);

  // Combined error state
  const hasError = useMemo(() => {
    return kpisQuery.isError || 
           stackedBarQuery.isError || 
           supplierQuery.isError || 
           rootCauseQuery.isError || 
           recentClaimsQuery.isError;
  }, [
    kpisQuery.isError,
    stackedBarQuery.isError,
    supplierQuery.isError,
    rootCauseQuery.isError,
    recentClaimsQuery.isError
  ]);

  return {
    data: {
      kpis: kpisQuery.data,
      stackedBar: stackedBarQuery.data,
      supplier: supplierQuery.data,
      rootCause: rootCauseQuery.data,
      recentClaims: recentClaimsQuery.data
    },
    isLoading,
    hasError,
    refetch: () => {
      kpisQuery.refetch();
      stackedBarQuery.refetch();
      supplierQuery.refetch();
      rootCauseQuery.refetch();
      recentClaimsQuery.refetch();
    },
    prefetchRelatedData
  };
};
