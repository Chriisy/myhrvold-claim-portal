
import { supabase } from '@/integrations/supabase/client';
import { CalculationMemo } from '@/utils/memoization';

export interface SystemMetrics {
  dbConnectionTime: number;
  memoryUsage: number;
  errorRate: number;
  activeUsers: number;
  lastUpdate: Date;
}

export class SystemHealthService {
  private static readonly CACHE_KEY = 'system-metrics';
  private static readonly CACHE_TTL = 30 * 1000; // 30 seconds

  static async collectMetrics(): Promise<SystemMetrics> {
    return CalculationMemo.memoize(this.CACHE_KEY, async () => {
      const startTime = performance.now();
      
      // Test database connection with timeout
      const connectionPromise = supabase.from('claims').select('count').limit(1);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 5000)
      );

      try {
        const { error: dbError } = await Promise.race([connectionPromise, timeoutPromise]) as any;
        const dbConnectionTime = performance.now() - startTime;
        
        if (dbError) {
          throw new Error(`Database connection failed: ${dbError.message}`);
        }

        // Get memory usage (if available)
        const memoryUsage = this.getMemoryUsage();

        // Simulate error rate (in real app, this would come from monitoring)
        const errorRate = 0;

        // Get active session efficiently
        const activeUsers = await this.getActiveUsersCount();

        return {
          dbConnectionTime: Math.round(dbConnectionTime),
          memoryUsage: Math.round(memoryUsage * 10) / 10,
          errorRate,
          activeUsers,
          lastUpdate: new Date()
        };
      } catch (error) {
        console.error('System metrics collection failed:', error);
        throw error;
      }
    });
  }

  private static getMemoryUsage(): number {
    try {
      // Check if performance memory API is available
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        return memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
      }
      
      // Fallback estimation based on DOM complexity
      const domNodes = document.querySelectorAll('*').length;
      return Math.max(10, domNodes / 1000); // Rough estimation
    } catch {
      return 15; // Default fallback
    }
  }

  private static async getActiveUsersCount(): Promise<number> {
    try {
      const { data: session } = await supabase.auth.getSession();
      return session.session ? 1 : 0;
    } catch {
      return 0;
    }
  }

  static clearCache(): void {
    CalculationMemo.clear();
  }
}
