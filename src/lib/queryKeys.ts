
import { DashboardFilters } from '@/types/dashboard';

interface ClaimsQueryFilters {
  searchTerm?: string;
  statusFilter?: string;
  categoryFilter?: string;
  partNumberFilter?: string;
  page?: number;
  pageSize?: number;
}

export const queryKeys = {
  // Claims queries
  claims: {
    all: ['claims'] as const,
    list: (filters?: ClaimsQueryFilters) => [...queryKeys.claims.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.claims.all, 'detail', id] as const,
  },
  
  // Timeline queries
  timeline: {
    all: ['timeline'] as const,
    claim: (claimId: string) => [...queryKeys.timeline.all, 'claim', claimId] as const,
  },
  
  // Cost queries
  costs: {
    all: ['costs'] as const,
    claim: (claimId: string) => [...queryKeys.costs.all, 'claim', claimId] as const,
  },
  
  // Credit queries
  credits: {
    all: ['credits'] as const,
    claim: (claimId: string) => [...queryKeys.credits.all, 'claim', claimId] as const,
  },
  
  // Dashboard queries
  dashboard: {
    all: ['dashboard'] as const,
    kpis: (filters: DashboardFilters) => [...queryKeys.dashboard.all, 'kpis', filters] as const,
    costByAccount: (filters: DashboardFilters) => [...queryKeys.dashboard.all, 'costByAccount', filters] as const,
    stackedBar: (filters: DashboardFilters) => [...queryKeys.dashboard.all, 'stackedBar', filters] as const,
    supplierDistribution: (filters: DashboardFilters) => [...queryKeys.dashboard.all, 'supplierDistribution', filters] as const,
    rootCause: (filters: DashboardFilters) => [...queryKeys.dashboard.all, 'rootCause', filters] as const,
    recentClaims: (filters: DashboardFilters) => [...queryKeys.dashboard.all, 'recentClaims', filters] as const,
  },
  
  // System health queries
  systemHealth: {
    all: ['systemHealth'] as const,
    metrics: () => [...queryKeys.systemHealth.all, 'metrics'] as const,
  },
  
  // User queries
  users: {
    all: ['users'] as const,
    technicians: () => [...queryKeys.users.all, 'technicians'] as const,
  },
  
  // Account codes queries
  accountCodes: {
    all: ['accountCodes'] as const,
    list: () => [...queryKeys.accountCodes.all, 'list'] as const,
  },
  
  // Suppliers queries
  suppliers: {
    all: ['suppliers'] as const,
    list: () => [...queryKeys.suppliers.all, 'list'] as const,
  },
} as const;
