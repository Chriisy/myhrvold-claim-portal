
import { CacheService } from './cacheService';
import { DashboardFilters } from '@/types/dashboard';

// Cache configurations for different data types
const CACHE_CONFIGS = {
  kpis: { ttl: 5 * 60 * 1000, maxSize: 50 }, // 5 minutes
  charts: { ttl: 10 * 60 * 1000, maxSize: 30 }, // 10 minutes
  suppliers: { ttl: 30 * 60 * 1000, maxSize: 20 }, // 30 minutes
  systemHealth: { ttl: 1 * 60 * 1000, maxSize: 10 }, // 1 minute
};

export class DashboardCache {
  private static kpiCache = CacheService.getInstance('dashboard-kpis', CACHE_CONFIGS.kpis);
  private static chartCache = CacheService.getInstance('dashboard-charts', CACHE_CONFIGS.charts);
  private static supplierCache = CacheService.getInstance('suppliers', CACHE_CONFIGS.suppliers);
  private static systemCache = CacheService.getInstance('system-health', CACHE_CONFIGS.systemHealth);

  // Generate cache keys based on filters
  static generateKpiKey(filters: DashboardFilters): string {
    return `kpis-${JSON.stringify(filters)}`;
  }

  static generateChartKey(chartType: string, filters: DashboardFilters): string {
    return `chart-${chartType}-${JSON.stringify(filters)}`;
  }

  static generateSupplierKey(): string {
    return 'suppliers-list';
  }

  static generateSystemHealthKey(): string {
    return 'system-health-metrics';
  }

  // KPI cache methods
  static setKpiData(filters: DashboardFilters, data: any): void {
    this.kpiCache.set(this.generateKpiKey(filters), data);
  }

  static getKpiData(filters: DashboardFilters): any | null {
    return this.kpiCache.get(this.generateKpiKey(filters));
  }

  // Chart cache methods
  static setChartData(chartType: string, filters: DashboardFilters, data: any): void {
    this.chartCache.set(this.generateChartKey(chartType, filters), data);
  }

  static getChartData(chartType: string, filters: DashboardFilters): any | null {
    return this.chartCache.get(this.generateChartKey(chartType, filters));
  }

  // Supplier cache methods
  static setSupplierData(data: any): void {
    this.supplierCache.set(this.generateSupplierKey(), data);
  }

  static getSupplierData(): any | null {
    return this.supplierCache.get(this.generateSupplierKey());
  }

  // System health cache methods
  static setSystemHealthData(data: any): void {
    this.systemCache.set(this.generateSystemHealthKey(), data);
  }

  static getSystemHealthData(): any | null {
    return this.systemCache.get(this.generateSystemHealthKey());
  }

  // Clear specific cache types
  static clearKpiCache(): void {
    this.kpiCache.clear();
  }

  static clearChartCache(): void {
    this.chartCache.clear();
  }

  static clearAllDashboardCache(): void {
    this.kpiCache.clear();
    this.chartCache.clear();
  }

  // Get cache statistics
  static getCacheStats() {
    return {
      kpis: this.kpiCache.getStats(),
      charts: this.chartCache.getStats(),
      suppliers: this.supplierCache.getStats(),
      systemHealth: this.systemCache.getStats()
    };
  }
}
