
import { TrendingUp, AlertTriangle, CheckCircle, Clock, DollarSign, Timer } from 'lucide-react';
import { useDashboardFilters } from '@/contexts/DashboardFiltersContext';
import { useKPIData } from '@/hooks/useOptimizedDashboardData';
import KpiCard from './KpiCard';
import { useMemo } from 'react';

const OptimizedKPICards = () => {
  const { filters } = useDashboardFilters();
  const { data: kpis, isLoading } = useKPIData(filters);

  const kpiData = useMemo(() => [
    { 
      title: 'Nye Reklamasjoner', 
      value: kpis?.newClaims || 0, 
      icon: AlertTriangle, 
      color: 'text-orange-600', 
      bgColor: 'bg-orange-100',
      link: '/claims?status=Ny'
    },
    { 
      title: 'Åpne Saker', 
      value: kpis?.openClaims || 0, 
      icon: Clock, 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-100',
      link: '/claims?status=Avventer,Godkjent'
    },
    { 
      title: 'Forfalt', 
      value: kpis?.overdueClaims || 0, 
      icon: AlertTriangle, 
      color: 'text-red-600', 
      bgColor: 'bg-red-100',
      link: '/claims?overdue=true'
    },
    { 
      title: 'Avsluttet i måneden', 
      value: kpis?.closedThisMonth || 0, 
      icon: CheckCircle, 
      color: 'text-green-600', 
      bgColor: 'bg-green-100',
      link: '/claims?closed_this_month=true'
    },
    {
      title: 'Garantikostnad (30d)',
      value: `${(kpis?.totalWarrantyCost || 0).toLocaleString('nb-NO')} kr`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Gjennomsnittlig lukketid',
      value: `${kpis?.avgLeadTime || 0} dager`,
      icon: Timer,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    }
  ], [kpis]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {kpiData.map((kpi, index) => (
        <KpiCard
          key={index}
          title={kpi.title}
          value={kpi.value}
          icon={kpi.icon}
          color={kpi.color}
          bgColor={kpi.bgColor}
          link={kpi.link}
          loading={isLoading}
        />
      ))}
    </div>
  );
};

export default OptimizedKPICards;
