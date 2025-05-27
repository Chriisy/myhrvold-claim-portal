
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

export const DashboardHeader = () => {
  const isMobile = useIsMobile();

  return (
    <div className={`responsive-flex items-center justify-between gap-4 mb-6 ${isMobile ? 'space-y-4' : ''}`}>
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden" />
        <div className="text-center md:text-left">
          <h1 className="responsive-text-xl font-bold text-myhrvold-primary">Dashboard</h1>
          <p className="text-gray-600 text-sm md:text-base">Oversikt over reklamasjoner og nøkkeltall</p>
        </div>
      </div>
      <Link to="/claim/new" className="w-full md:w-auto">
        <Button className="btn-primary w-full md:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Ny Reklamasjon
        </Button>
      </Link>
    </div>
  );
};
