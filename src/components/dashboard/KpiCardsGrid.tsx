
import { AlertTriangle, CheckCircle, Clock, TrendingUp, Wrench, Timer } from 'lucide-react';
import { useDashboardFilters } from '@/contexts/DashboardFiltersContext';
import { useDashboardKPIs } from '@/hooks/api/dashboard/useDashboardKPIs';
import { memo } from 'react';
import KpiCard from './KpiCard';

const KpiCardsGrid = memo(() => {
  const { filters } = useDashboardFilters();
  const { data: kpiData, isLoading } = useDashboardKPIs(filters);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
      <KpiCard
        title="Nye Reklamasjoner"
        value={kpiData?.newClaims || 0}
        icon={AlertTriangle}
        color="text-yellow-600"
        bgColor="bg-yellow-100"
        link="/claims?status=Ny"
        loading={isLoading}
        trend={kpiData?.trends?.newClaims}
        isGoodTrend={false} // Lower is better for new claims
      />
      
      <KpiCard
        title="Åpne Reklamasjoner"
        value={kpiData?.openClaims || 0}
        icon={Clock}
        color="text-blue-600"
        bgColor="bg-blue-100"
        link="/claims?status=Avventer,Godkjent"
        loading={isLoading}
        trend={kpiData?.trends?.openClaims}
        isGoodTrend={false} // Lower is better for open claims
      />
      
      <KpiCard
        title="Forfalt"
        value={kpiData?.overdueClaims || 0}
        icon={AlertTriangle}
        color="text-red-600"
        bgColor="bg-red-100"
        link="/claims?overdue=true"
        loading={isLoading}
        trend={kpiData?.trends?.overdueClaims}
        isGoodTrend={false} // Lower is better for overdue claims
      />
      
      <KpiCard
        title="Lukket Denne Måneden"
        value={kpiData?.closedThisMonth || 0}
        icon={CheckCircle}
        color="text-green-600"
        bgColor="bg-green-100"
        loading={isLoading}
        trend={kpiData?.trends?.closedThisMonth}
        isGoodTrend={true} // Higher is better for closed claims
      />
      
      <KpiCard
        title="Garantikostnader (30d)"
        value={`${(kpiData?.totalWarrantyCost || 0).toLocaleString('nb-NO')} kr`}
        icon={Wrench}
        color="text-purple-600"
        bgColor="bg-purple-100"
        loading={isLoading}
        trend={kpiData?.trends?.totalWarrantyCost}
        isGoodTrend={false} // Lower is better for warranty costs
      />
      
      <KpiCard
        title="Snitt Behandlingstid"
        value={`${kpiData?.avgLeadTime || 0} dager`}
        icon={Timer}
        color="text-indigo-600"
        bgColor="bg-indigo-100"
        loading={isLoading}
        trend={kpiData?.trends?.avgLeadTime}
        isGoodTrend={false} // Lower is better for lead time
      />
    </div>
  );
});

KpiCardsGrid.displayName = 'KpiCardsGrid';

export default KpiCardsGrid;
