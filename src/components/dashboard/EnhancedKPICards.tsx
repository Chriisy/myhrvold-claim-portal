
import { TrendingUp, AlertTriangle, CheckCircle, Clock, DollarSign, Timer } from 'lucide-react';
import { useDashboardKPIs, useEnhancedDashboardKPIs } from '@/hooks/useDashboardData';
import { useEnhancedDashboardKPIs as useNewKPIs } from '@/hooks/useEnhancedDashboardData';
import { useDashboardFilters } from '@/contexts/DashboardFiltersContext';
import KpiCard from './KpiCard';

const EnhancedKPICards = () => {
  const { filters } = useDashboardFilters();
  const { data: kpis, isLoading: kpisLoading } = useDashboardKPIs(filters);
  const { data: enhancedKpis, isLoading: enhancedLoading } = useNewKPIs(filters);

  const isLoading = kpisLoading || enhancedLoading;

  const kpiData = [
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
      value: enhancedKpis?.overdueClaims || 0, 
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
      value: `${(enhancedKpis?.totalWarrantyCost || 0).toLocaleString('nb-NO')} kr`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Gjennomsnittlig lukketid',
      value: `${enhancedKpis?.avgLeadTime || 0} dager`,
      icon: Timer,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    }
  ];

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

export default EnhancedKPICards;
