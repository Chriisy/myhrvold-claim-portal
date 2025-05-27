
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardHeader = () => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8 mb-8 lg:mb-12">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="lg:hidden" />
        <div>
          <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-myhrvold-primary">Dashboard</h1>
          <p className="text-gray-600 text-sm lg:text-base xl:text-lg mt-1">Oversikt over reklamasjoner og nøkkeltall</p>
        </div>
      </div>
      <Link to="/claim/new" className="w-full lg:w-auto">
        <Button className="btn-primary w-full lg:w-auto lg:px-8 lg:py-3 text-base">
          <Plus className="w-4 h-4 mr-2" />
          Ny Reklamasjon
        </Button>
      </Link>
    </div>
  );
};
