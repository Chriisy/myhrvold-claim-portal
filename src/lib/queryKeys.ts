
export const queryKeys = {
  // Dashboard queries
  dashboard: {
    all: ['dashboard'] as const,
    kpis: (filters: any) => ['dashboard', 'kpis', filters] as const,
    costByAccount: (filters: any) => ['dashboard', 'cost-by-account', filters] as const,
    supplierDistribution: (filters: any) => ['dashboard', 'supplier-distribution', filters] as const,
    recentClaims: (filters: any) => ['dashboard', 'recent-claims', filters] as const,
  },
  
  // Account queries
  accounts: {
    all: ['accounts'] as const,
    codes: () => ['accounts', 'codes'] as const,
  },
  
  // Claims queries
  claims: {
    all: ['claims'] as const,
    byId: (id: string) => ['claims', id] as const,
    list: (filters: any) => ['claims', 'list', filters] as const,
  },
  
  // Suppliers queries
  suppliers: {
    all: ['suppliers'] as const,
    list: () => ['suppliers', 'list'] as const,
  }
} as const;
