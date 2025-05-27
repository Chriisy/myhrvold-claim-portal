
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

export const DashboardHeader = () => {
  const isMobile = useIsMobile();

  return (
    <div className={`flex items-center justify-between ${isMobile ? 'flex-col gap-4' : ''}`}>
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-3xl font-bold text-myhrvold-primary">Dashboard</h1>
          <p className="text-gray-600">Oversikt over reklamasjoner og nøkkeltall</p>
        </div>
      </div>
      <Link to="/claim/new">
        <Button className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Ny Reklamasjon
        </Button>
      </Link>
    </div>
  );
};
