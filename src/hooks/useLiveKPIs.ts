
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, startOfWeek, startOfMonth, subDays } from 'date-fns';
import { useEffect, useRef } from 'react';

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
  const intervalRef = useRef<NodeJS.Timeout>();

  // Cleanup on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return useQuery({
    queryKey: ['live-kpis'],
    queryFn: async (): Promise<LiveKPIData> => {
      const now = new Date();
      const today = startOfDay(now);
      const thisWeek = startOfWeek(now, { weekStartsOn: 1 });
      const thisMonth = startOfMonth(now);
      const yesterday = startOfDay(subDays(now, 1));

      try {
        // Get claims data for different periods with error handling
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

        // Handle potential errors from Supabase calls
        if (todayResult.error) throw new Error(`Today claims error: ${todayResult.error.message}`);
        if (weekResult.error) throw new Error(`Week claims error: ${weekResult.error.message}`);
        if (monthResult.error) throw new Error(`Month claims error: ${monthResult.error.message}`);
        if (yesterdayResult.error) throw new Error(`Yesterday claims error: ${yesterdayResult.error.message}`);

        const todayClaims = todayResult.data?.length || 0;
        const weekClaims = weekResult.data?.length || 0;
        const monthClaims = monthResult.data?.length || 0;
        const yesterdayClaims = yesterdayResult.data?.length || 0;

        // Calculate average resolution time for this week with null safety
        const closedThisWeek = weekResult.data?.filter(claim => claim.closed_at) || [];
        const avgResolutionTime = closedThisWeek.length > 0 
          ? closedThisWeek.reduce((sum, claim) => {
              const created = new Date(claim.created_at);
              const closed = new Date(claim.closed_at!);
              const days = Math.floor((closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
              return sum + Math.max(0, days); // Ensure non-negative values
            }, 0) / closedThisWeek.length
          : 0;

        // Calculate warranty recovery rate with null safety
        const warrantyClaimsThisMonth = monthResult.data?.filter(claim => claim.warranty) || [];
        const warrantyRecoveryRate = monthClaims > 0 
          ? (warrantyClaimsThisMonth.length / monthClaims) * 100 
          : 0;

        // Find top issue category this week with better error handling
        const categoryCount = weekResult.data?.reduce((acc, claim) => {
          const cat = claim.category || 'Ukjent';
          acc[cat] = (acc[cat] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};
        
        const topIssueCategory = Object.entries(categoryCount)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Ingen data';

        // Calculate trend direction with safer comparison
        let trendDirection: 'up' | 'down' | 'stable' = 'stable';
        if (todayClaims > yesterdayClaims) trendDirection = 'up';
        else if (todayClaims < yesterdayClaims) trendDirection = 'down';

        // Calculate cost savings with realistic estimation
        const costSavingsToday = Math.round(todayClaims * 2500);

        return {
          todayClaims,
          weekClaims,
          monthClaims,
          avgResolutionTime: Math.round(Math.max(0, avgResolutionTime)),
          warrantyRecoveryRate: Math.round(Math.max(0, Math.min(100, warrantyRecoveryRate))),
          topIssueCategory,
          costSavingsToday,
          trendDirection
        };
      } catch (error) {
        console.error('Error fetching live KPI data:', error);
        // Return safe defaults on error
        return {
          todayClaims: 0,
          weekClaims: 0,
          monthClaims: 0,
          avgResolutionTime: 0,
          warrantyRecoveryRate: 0,
          topIssueCategory: 'Feil ved lasting',
          costSavingsToday: 0,
          trendDirection: 'stable'
        };
      }
    },
    refetchInterval: 60000, // Reduced to 1 minute to be less aggressive
    staleTime: 30000, // Data is fresh for 30 seconds
    retry: 2, // Limit retries to prevent excessive API calls
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Exponential backoff
  });
};
