
import { QueryClient } from '@tanstack/react-query';

interface PrefetchConfig {
  queryKey: any[];
  queryFn?: () => Promise<any>;
  staleTime?: number;
  priority?: 'high' | 'normal' | 'low';
}

class PrefetchService {
  private queryClient: QueryClient;
  private prefetchQueue: Map<string, PrefetchConfig> = new Map();
  private isProcessing = false;

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }

  // Prefetch both code and data for a route
  async prefetchRoute(routeName: string, configs: {
    moduleLoader?: () => Promise<any>;
    queries?: PrefetchConfig[];
  }) {
    const promises: Promise<any>[] = [];

    // Prefetch module
    if (configs.moduleLoader) {
      promises.push(
        configs.moduleLoader().catch(error => {
          console.warn(`Failed to prefetch module for ${routeName}:`, error);
        })
      );
    }

    // Prefetch queries
    if (configs.queries) {
      configs.queries.forEach(config => {
        const key = JSON.stringify(config.queryKey);
        this.prefetchQueue.set(key, config);
      });
      
      if (!this.isProcessing) {
        promises.push(this.processQueue());
      }
    }

    return Promise.allSettled(promises);
  }

  private async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    const entries = Array.from(this.prefetchQueue.entries());
    
    // Sort by priority
    const sortedEntries = entries.sort(([, a], [, b]) => {
      const priorityOrder = { high: 0, normal: 1, low: 2 };
      return priorityOrder[a.priority || 'normal'] - priorityOrder[b.priority || 'normal'];
    });

    for (const [key, config] of sortedEntries) {
      try {
        await this.queryClient.prefetchQuery({
          queryKey: config.queryKey,
          queryFn: config.queryFn,
          staleTime: config.staleTime || 5 * 60 * 1000, // 5 minutes
        });
        this.prefetchQueue.delete(key);
      } catch (error) {
        console.warn('Failed to prefetch query:', config.queryKey, error);
        this.prefetchQueue.delete(key);
      }
    }

    this.isProcessing = false;
  }

  // Prefetch critical data used across multiple pages
  prefetchCriticalData() {
    return this.prefetchRoute('critical', {
      queries: [
        {
          queryKey: ['users'],
          priority: 'high',
          staleTime: 10 * 60 * 1000, // 10 minutes
        },
        {
          queryKey: ['suppliers'],
          priority: 'high', 
          staleTime: 15 * 60 * 1000, // 15 minutes
        },
        {
          queryKey: ['accounts.codes'],
          priority: 'normal',
          staleTime: 30 * 60 * 1000, // 30 minutes
        }
      ]
    });
  }
}

export default PrefetchService;

// Route-specific prefetch configurations
export const ROUTE_PREFETCH_CONFIGS = {
  dashboard: {
    moduleLoader: () => import('@/components/dashboard/OptimizedDashboard'),
    queries: [
      { queryKey: ['dashboard', 'kpis'], priority: 'high' as const },
      { queryKey: ['dashboard', 'recent-claims'], priority: 'high' as const },
      { queryKey: ['claims'], priority: 'normal' as const },
    ]
  },
  claims: {
    moduleLoader: () => import('@/pages/ClaimsList'),
    queries: [
      { queryKey: ['claims'], priority: 'high' as const },
      { queryKey: ['suppliers'], priority: 'normal' as const },
      { queryKey: ['users'], priority: 'normal' as const },
    ]
  },
  users: {
    moduleLoader: () => import('@/pages/UserManagement'),
    queries: [
      { queryKey: ['users'], priority: 'high' as const },
    ]
  },
  suppliers: {
    moduleLoader: () => import('@/pages/Suppliers'),
    queries: [
      { queryKey: ['suppliers'], priority: 'high' as const },
      { queryKey: ['claims'], priority: 'low' as const },
    ]
  },
  installations: {
    moduleLoader: () => import('@/pages/Installations'),
    queries: [
      { queryKey: ['installations'], priority: 'high' as const },
      { queryKey: ['users'], priority: 'normal' as const },
    ]
  },
  reports: {
    moduleLoader: () => import('@/pages/Reports'),
    queries: [
      { queryKey: ['claims'], priority: 'normal' as const },
      { queryKey: ['suppliers'], priority: 'normal' as const },
    ]
  },
  certificates: {
    moduleLoader: () => import('@/pages/FGasCertificates'),
    queries: [
      { queryKey: ['certificates'], priority: 'high' as const },
      { queryKey: ['users'], priority: 'normal' as const },
    ]
  },
  import: {
    moduleLoader: () => import('@/pages/InvoiceImport'),
    queries: [
      { queryKey: ['suppliers'], priority: 'normal' as const },
      { queryKey: ['accounts.codes'], priority: 'normal' as const },
    ]
  },
};
