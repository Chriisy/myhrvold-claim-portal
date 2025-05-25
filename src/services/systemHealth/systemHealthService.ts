
import { supabase } from '@/integrations/supabase/client';

export interface SystemMetrics {
  dbConnectionTime: number;
  memoryUsage: number;
  errorRate: number;
  activeUsers: number;
  lastUpdate: Date;
}

export class SystemHealthService {
  static async collectMetrics(): Promise<SystemMetrics> {
    const startTime = performance.now();
    
    // Test database connection
    const { error: dbError } = await supabase.from('claims').select('count').limit(1);
    const dbConnectionTime = performance.now() - startTime;
    
    if (dbError) {
      throw new Error(`Database connection failed: ${dbError.message}`);
    }

    // Get memory usage (if available)
    const memoryUsage = (performance as any).memory?.usedJSHeapSize / 1024 / 1024 || 0;

    // Simulate error rate (in real app, this would come from monitoring)
    const errorRate = 0;

    // Get active session
    const { data: session } = await supabase.auth.getSession();
    const activeUsers = session.session ? 1 : 0;

    return {
      dbConnectionTime,
      memoryUsage,
      errorRate,
      activeUsers,
      lastUpdate: new Date()
    };
  }
}
