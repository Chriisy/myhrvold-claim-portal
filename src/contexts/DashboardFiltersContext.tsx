
import React, { createContext, useContext, useState, ReactNode, useDeferredValue } from 'react';
import { subDays } from 'date-fns';
import { DashboardFilters } from '@/types/dashboard';

interface DashboardFiltersContextType {
  filters: DashboardFilters;
  updateFilter: <K extends keyof DashboardFilters>(
    key: K,
    value: DashboardFilters[K]
  ) => void;
  resetFilters: () => void;
}

const DashboardFiltersContext = createContext<DashboardFiltersContextType | undefined>(undefined);

const defaultFilters: DashboardFilters = {
  date_range: {
    start: subDays(new Date(), 30),
    end: new Date()
  }
};

export const DashboardFiltersProvider = ({ children }: { children: ReactNode }) => {
  const [filters, setFilters] = useState<DashboardFilters>(defaultFilters);
  
  // Use deferred value to prevent unnecessary re-renders on rapid filter changes
  const deferredFilters = useDeferredValue(filters);

  const updateFilter = <K extends keyof DashboardFilters>(
    key: K,
    value: DashboardFilters[K]
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <DashboardFiltersContext.Provider value={{ 
      filters: deferredFilters, 
      updateFilter, 
      resetFilters 
    }}>
      {children}
    </DashboardFiltersContext.Provider>
  );
};

export const useDashboardFilters = () => {
  const context = useContext(DashboardFiltersContext);
  if (!context) {
    throw new Error('useDashboardFilters must be used within a DashboardFiltersProvider');
  }
  return context;
};
