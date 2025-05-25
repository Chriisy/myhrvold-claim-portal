
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  link?: string;
  loading?: boolean;
}

const KpiCard = ({ title, value, icon: Icon, color, bgColor, link, loading }: KpiCardProps) => {
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
};

export default KpiCard;
