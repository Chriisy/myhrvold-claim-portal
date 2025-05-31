
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { InstallationChecklist } from '@/components/installations/InstallationChecklist';
import { InstallationImageGallery } from '@/components/installations/InstallationImageGallery';
import { DeleteProjectDialog } from '@/components/installations/DeleteProjectDialog';
import { EditProjectDialog } from '@/components/installations/EditProjectDialog';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

const InstallationDetail = () => {
  const { id } = useParams();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { data: project, isLoading, error, refetch } = useQuery({
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ny': return 'bg-blue-100 text-blue-800';
      case 'Påbegynt': return 'bg-yellow-100 text-yellow-800';
      case 'Ferdig': return 'bg-green-100 text-green-800';
      case 'Avvik': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-myhrvold-primary">{project.project_name}</h1>
            <Badge className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
          </div>
          <div className="space-y-1 text-gray-600">
            {project.customer_name && <p>Kunde: {project.customer_name}</p>}
            {project.msnr && <p>MSNR: {project.msnr}</p>}
            {project.address && <p>Adresse: {project.address}</p>}
            {project.location && <p>Lokasjon: {project.location}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setEditDialogOpen(true)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Rediger
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Slett
          </Button>
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

      <DeleteProjectDialog
        projectId={project.id}
        projectName={project.project_name}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />

      <EditProjectDialog
        project={project}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onUpdate={refetch}
      />
    </div>
  );
};

export default InstallationDetail;
