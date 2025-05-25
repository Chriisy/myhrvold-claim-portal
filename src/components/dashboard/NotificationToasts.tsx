
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useDashboardKPIs } from '@/hooks/api/dashboard/useDashboardKPIs';
import { useDashboardFilters } from '@/contexts/DashboardFiltersContext';

export const NotificationToasts = () => {
  const { toast } = useToast();
  const { filters } = useDashboardFilters();
  const { data: kpiData } = useDashboardKPIs(filters);

  useEffect(() => {
    if (kpiData) {
      // Notify about overdue claims
      if (kpiData.overdueClaims > 0) {
        toast({
          title: "⚠️ Forfalt reklamasjoner",
          description: `Du har ${kpiData.overdueClaims} reklamasjon(er) som er forfalt`,
          variant: "destructive",
        });
      }

      // Notify about high warranty costs
      if (kpiData.totalWarrantyCost > 100000) {
        toast({
          title: "💰 Høye garantikostnader",
          description: `Garantikostnader siste 30 dager: ${kpiData.totalWarrantyCost.toLocaleString('nb-NO')} kr`,
        });
      }

      // Positive notification for closed claims
      if (kpiData.closedThisMonth > 10) {
        toast({
          title: "🎉 Godt arbeid!",
          description: `${kpiData.closedThisMonth} reklamasjoner lukket denne måneden`,
        });
      }
    }
  }, [kpiData, toast]);

  return null; // This component only handles side effects
};
