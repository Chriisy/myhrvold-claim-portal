
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useDashboardKPIs } from '@/hooks/useDashboardData';
import { useDashboardFilters } from '@/contexts/DashboardFiltersContext';
import { Link } from 'react-router-dom';

const KPICards = () => {
  const { filters } = useDashboardFilters();
  const { data: kpis, isLoading } = useDashboardKPIs(filters);

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
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="w-24 h-4 bg-gray-200 rounded"></div>
                  <div className="w-16 h-6 bg-gray-200 rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpiData.map((kpi, index) => (
        <Link key={index} to={kpi.link}>
          <Card className="card-hover cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${kpi.bgColor}`}>
                  <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                  <p className="text-2xl font-bold text-myhrvold-primary">{kpi.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default KPICards;
