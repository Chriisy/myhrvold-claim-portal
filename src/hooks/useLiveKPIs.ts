
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, startOfWeek, startOfMonth, subDays } from 'date-fns';

interface LiveKPIData {
  todayClaims: number;
  weekClaims: number;
  monthClaims: number;
  avgResolutionTime: number;
  warrantyRecoveryRate: number;
  topIssueCategory: string;
  costSavingsToday: number;
  trendDirection: 'up' | 'down' | 'stable';
}

export const useLiveKPIs = () => {
  return useQuery({
    queryKey: ['live-kpis'],
    queryFn: async (): Promise<LiveKPIData> => {
      const now = new Date();
      const today = startOfDay(now);
      const thisWeek = startOfWeek(now, { weekStartsOn: 1 });
      const thisMonth = startOfMonth(now);
      const yesterday = startOfDay(subDays(now, 1));

      // Get claims data for different periods
      const [todayResult, weekResult, monthResult, yesterdayResult] = await Promise.all([
        // Today's claims
        supabase
          .from('claims')
          .select('id, status, created_at, warranty')
          .gte('created_at', today.toISOString())
          .is('deleted_at', null),
        
        // This week's claims
        supabase
          .from('claims')
          .select('id, category, closed_at, created_at')
          .gte('created_at', thisWeek.toISOString())
          .is('deleted_at', null),
        
        // This month's claims
        supabase
          .from('claims')
          .select('id, warranty')
          .gte('created_at', thisMonth.toISOString())
          .is('deleted_at', null),
        
        // Yesterday's claims for trend
        supabase
          .from('claims')
          .select('id')
          .gte('created_at', yesterday.toISOString())
          .lt('created_at', today.toISOString())
          .is('deleted_at', null)
      ]);

      const todayClaims = todayResult.data?.length || 0;
      const weekClaims = weekResult.data?.length || 0;
      const monthClaims = monthResult.data?.length || 0;
      const yesterdayClaims = yesterdayResult.data?.length || 0;

      // Calculate average resolution time for this week
      const closedThisWeek = weekResult.data?.filter(claim => claim.closed_at) || [];
      const avgResolutionTime = closedThisWeek.length > 0 
        ? closedThisWeek.reduce((sum, claim) => {
            const created = new Date(claim.created_at);
            const closed = new Date(claim.closed_at!);
            const days = Math.floor((closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
            return sum + days;
          }, 0) / closedThisWeek.length
        : 0;

      // Calculate warranty recovery rate
      const warrantyClaimsThisMonth = monthResult.data?.filter(claim => claim.warranty) || [];
      const warrantyRecoveryRate = monthClaims > 0 
        ? (warrantyClaimsThisMonth.length / monthClaims) * 100 
        : 0;

      // Find top issue category this week
      const categoryCount = weekResult.data?.reduce((acc, claim) => {
        const cat = claim.category || 'Ukjent';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      
      const topIssueCategory = Object.entries(categoryCount)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Ingen data';

      // Calculate trend direction
      let trendDirection: 'up' | 'down' | 'stable' = 'stable';
      if (todayClaims > yesterdayClaims) trendDirection = 'up';
      else if (todayClaims < yesterdayClaims) trendDirection = 'down';

      // Mock cost savings (would be calculated from actual cost data)
      const costSavingsToday = todayClaims * 2500; // Rough estimate

      return {
        todayClaims,
        weekClaims,
        monthClaims,
        avgResolutionTime: Math.round(avgResolutionTime),
        warrantyRecoveryRate: Math.round(warrantyRecoveryRate),
        topIssueCategory,
        costSavingsToday,
        trendDirection
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds for "live" data
    staleTime: 10000, // Consider data stale after 10 seconds
  });
};
