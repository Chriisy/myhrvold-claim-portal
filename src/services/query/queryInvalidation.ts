
import { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { DashboardCache } from '@/services/cache/dashboardCache';

export class QueryInvalidationService {
  private static queryClient: QueryClient;

  static setQueryClient(client: QueryClient): void {
    this.queryClient = client;
  }

  // Invalidate related queries when data changes
  static async invalidateClaimRelated(claimId?: string): Promise<void> {
    const promises = [
      this.queryClient.invalidateQueries({ queryKey: queryKeys.claims.all }),
      this.queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
    ];

    if (claimId) {
      promises.push(
        this.queryClient.invalidateQueries({ queryKey: queryKeys.claims.detail(claimId) }),
        this.queryClient.invalidateQueries({ queryKey: queryKeys.timeline.claim(claimId) }),
        this.queryClient.invalidateQueries({ queryKey: queryKeys.costs.claim(claimId) }),
        this.queryClient.invalidateQueries({ queryKey: queryKeys.credits.claim(claimId) })
      );
    }

    // Clear dashboard cache
    DashboardCache.clearAllDashboardCache();

    await Promise.all(promises);
  }

  static async invalidateDashboardData(): Promise<void> {
    await this.queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    DashboardCache.clearAllDashboardCache();
  }

  static async invalidateSupplierData(): Promise<void> {
    const promises = [
      this.queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all }),
      this.queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
    ];

    DashboardCache.clearAllDashboardCache();

    await Promise.all(promises);
  }

  static async invalidateSystemHealth(): Promise<void> {
    await this.queryClient.invalidateQueries({ queryKey: queryKeys.systemHealth.all });
    DashboardCache.clearAllDashboardCache();
  }

  // Smart invalidation based on data type
  static async smartInvalidate(dataType: 'claim' | 'supplier' | 'dashboard' | 'system', id?: string): Promise<void> {
    switch (dataType) {
      case 'claim':
        await this.invalidateClaimRelated(id);
        break;
      case 'supplier':
        await this.invalidateSupplierData();
        break;
      case 'dashboard':
        await this.invalidateDashboardData();
        break;
      case 'system':
        await this.invalidateSystemHealth();
        break;
    }
  }

  // Prefetch important data
  static async prefetchCriticalData(): Promise<void> {
    const promises = [
      this.queryClient.prefetchQuery({
        queryKey: queryKeys.suppliers.list(),
        staleTime: 30 * 60 * 1000, // 30 minutes
      }),
      this.queryClient.prefetchQuery({
        queryKey: queryKeys.accountCodes.list(),
        staleTime: 30 * 60 * 1000, // 30 minutes
      }),
      this.queryClient.prefetchQuery({
        queryKey: queryKeys.users.technicians(),
        staleTime: 15 * 60 * 1000, // 15 minutes
      }),
    ];

    await Promise.all(promises);
  }
}
