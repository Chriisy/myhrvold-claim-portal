
import React, { createContext, useContext, useState, ReactNode } from 'react';
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
    <DashboardFiltersContext.Provider value={{ filters, updateFilter, resetFilters }}>
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
