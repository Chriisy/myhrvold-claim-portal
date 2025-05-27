
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardHeader = () => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8 xl:gap-12">
      <div className="flex items-center gap-4 lg:gap-6">
        <SidebarTrigger className="lg:hidden" />
        <div>
          <h1 className="text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-myhrvold-primary">Dashboard</h1>
          <p className="text-gray-600 text-base lg:text-lg xl:text-xl 2xl:text-2xl mt-2">Oversikt over reklamasjoner og nøkkeltall</p>
        </div>
      </div>
      <Link to="/claim/new" className="w-full lg:w-auto">
        <Button className="btn-primary w-full lg:w-auto lg:px-10 lg:py-4 xl:px-12 xl:py-5 text-lg lg:text-xl">
          <Plus className="w-5 h-5 lg:w-6 lg:h-6 mr-3" />
          Ny Reklamasjon
        </Button>
      </Link>
    </div>
  );
};
