
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

export const DashboardHeader = () => {
  const isMobile = useIsMobile();

  return (
    <div className="flex items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="lg:hidden" />
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-myhrvold-primary">Dashboard</h1>
          <p className="text-gray-600 text-base lg:text-lg mt-1">Oversikt over reklamasjoner og nøkkeltall</p>
        </div>
      </div>
      <Link to="/claim/new" className={isMobile ? "w-full" : ""}>
        <Button className={`btn-primary ${isMobile ? "w-full" : "px-6 py-3"}`}>
          <Plus className="w-4 h-4 mr-2" />
          Ny Reklamasjon
        </Button>
      </Link>
    </div>
  );
};
