
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { InstallationChecklist } from '@/components/installations/InstallationChecklist';
import { InstallationImageGallery } from '@/components/installations/InstallationImageGallery';

const InstallationDetail = () => {
  const { id } = useParams();

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['installation-project', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('installation_projects')
        .select(`
          *,
          assigned_technician:users!assigned_technician_id(name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-myhrvold-primary">Laster prosjekt...</h1>
            <p className="text-gray-600">Henter data fra databasen</p>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-myhrvold-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <Link to="/installations">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tilbake
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-myhrvold-primary">Kunne ikke laste prosjekt</h1>
            <p className="text-gray-600">Prosjektet ble ikke funnet eller du har ikke tilgang</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <Link to="/installations">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tilbake
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-myhrvold-primary">{project.project_name}</h1>
          <p className="text-gray-600">
            {project.customer_name} - {project.location}
          </p>
        </div>
      </div>

      <Tabs defaultValue="checklist" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="checklist">Sjekkliste</TabsTrigger>
          <TabsTrigger value="gallery">Bildegalleri</TabsTrigger>
        </TabsList>

        <TabsContent value="checklist" className="mt-6">
          <InstallationChecklist projectId={project.id} />
        </TabsContent>

        <TabsContent value="gallery" className="mt-6">
          <InstallationImageGallery projectId={project.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InstallationDetail;
