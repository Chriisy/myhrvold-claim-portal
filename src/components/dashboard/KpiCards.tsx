
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Clock, TrendingUp, Wrench, Timer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDashboardFilters } from '@/contexts/DashboardFiltersContext';
import { useKPIData } from '@/hooks/dashboard';
import { memo } from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  link?: string;
  loading?: boolean;
}

const KpiCard = memo(({ title, value, icon: Icon, color, bgColor, link, loading }: KpiCardProps) => {
  if (loading) {
    return (
      <Card className="animate-pulse">
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
    );
  }

  const CardComponent = () => (
    <Card className={`card-hover ${link ? 'cursor-pointer' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg ${bgColor}`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-myhrvold-primary">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (link) {
    return (
      <Link to={link}>
        <CardComponent />
      </Link>
    );
  }

  return <CardComponent />;
});

KpiCard.displayName = 'KpiCard';

const KpiCards = memo(() => {
  const { filters } = useDashboardFilters();
  const { data: kpiData, isLoading } = useKPIData(filters);

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
      />
      
      <KpiCard
        title="Åpne Reklamasjoner"
        value={kpiData?.openClaims || 0}
        icon={Clock}
        color="text-blue-600"
        bgColor="bg-blue-100"
        link="/claims?status=Avventer,Godkjent"
        loading={isLoading}
      />
      
      <KpiCard
        title="Forfalt"
        value={kpiData?.overdueClaims || 0}
        icon={AlertTriangle}
        color="text-red-600"
        bgColor="bg-red-100"
        link="/claims?overdue=true"
        loading={isLoading}
      />
      
      <KpiCard
        title="Lukket Denne Måneden"
        value={kpiData?.closedThisMonth || 0}
        icon={CheckCircle}
        color="text-green-600"
        bgColor="bg-green-100"
        loading={isLoading}
      />
      
      <KpiCard
        title="Garantikostnader (30d)"
        value={`${(kpiData?.totalWarrantyCost || 0).toLocaleString('nb-NO')} kr`}
        icon={Wrench}
        color="text-purple-600"
        bgColor="bg-purple-100"
        loading={isLoading}
      />
      
      <KpiCard
        title="Snitt Behandlingstid"
        value={`${kpiData?.avgLeadTime || 0} dager`}
        icon={Timer}
        color="text-indigo-600"
        bgColor="bg-indigo-100"
        loading={isLoading}
      />
    </div>
  );
});

KpiCards.displayName = 'KpiCards';

export default KpiCards;
