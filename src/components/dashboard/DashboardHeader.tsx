
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardHeader = () => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
      <div className="flex items-center gap-3 lg:gap-4">
        <SidebarTrigger className="lg:hidden" />
        <div className="card-header-spacing">
          <h1 className="text-heading-1 text-myhrvold-primary">Dashboard</h1>
          <p className="text-body text-muted-foreground">Oversikt over reklamasjoner og nøkkeltall</p>
        </div>
      </div>
      <Link to="/claim/new" className="w-full lg:w-auto">
        <Button className="btn-primary btn-icon-md w-full lg:w-auto lg:px-6 lg:py-3">
          <Plus />
          Ny Reklamasjon
        </Button>
      </Link>
    </div>
  );
};
