
import { useMemo, useDeferredValue, useCallback } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

export interface FilterConfig<T> {
  data: T[];
  searchFields: (keyof T)[];
  filters: Record<string, any>;
  sortBy?: keyof T;
  sortOrder?: 'asc' | 'desc';
}

export const useOptimizedFiltering = <T extends Record<string, any>>({
  data,
  searchFields,
  filters,
  sortBy,
  sortOrder = 'asc'
}: FilterConfig<T>) => {
  // Defer filter updates to prevent blocking UI
  const deferredFilters = useDeferredValue(filters);
  
  // Memoize the filtering logic
  const filteredData = useMemo(() => {
    if (!data?.length) return [];

    let result = data.slice(); // Create a copy

    // Apply search filter
    if (deferredFilters.search && searchFields.length > 0) {
      const searchTerm = deferredFilters.search.toLowerCase().trim();
      if (searchTerm) {
        result = result.filter(item =>
          searchFields.some(field => {
            const value = item[field];
            return value && String(value).toLowerCase().includes(searchTerm);
          })
        );
      }
    }

    // Apply other filters
    Object.entries(deferredFilters).forEach(([key, value]) => {
      if (key === 'search' || !value || value === 'all') return;
      
      result = result.filter(item => {
        const itemValue = item[key];
        if (Array.isArray(value)) {
          return value.includes(itemValue);
        }
        return itemValue === value;
      });
    });

    // Apply sorting
    if (sortBy) {
      result.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        
        if (aVal === bVal) return 0;
        
        const comparison = aVal < bVal ? -1 : 1;
        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [data, deferredFilters, searchFields, sortBy, sortOrder]);

  // Debounced search handler for input fields
  const createDebouncedSearch = useCallback((onSearch: (term: string) => void) => {
    return useDebounce(onSearch, 300);
  }, []);

  return {
    filteredData,
    isFiltering: deferredFilters !== filters, // True when filtering is deferred
    createDebouncedSearch
  };
};

// Hook for paginated results
export const usePaginatedFiltering = <T extends Record<string, any>>(
  config: FilterConfig<T> & { pageSize?: number; currentPage?: number }
) => {
  const { filteredData, isFiltering, createDebouncedSearch } = useOptimizedFiltering(config);
  
  const pageSize = config.pageSize || 10;
  const currentPage = config.currentPage || 1;
  
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  
  return {
    paginatedData,
    totalItems: filteredData.length,
    totalPages,
    currentPage,
    pageSize,
    isFiltering,
    createDebouncedSearch
  };
};
