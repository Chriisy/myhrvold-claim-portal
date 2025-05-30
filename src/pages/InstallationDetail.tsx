
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Trash2, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { InstallationChecklist } from '@/components/installations/InstallationChecklist';
import { InstallationImageGallery } from '@/components/installations/InstallationImageGallery';
import { ProjectStatusSelector } from '@/components/installations/ProjectStatusSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const InstallationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase
        .from('installation_projects')
        .delete()
        .eq('id', projectId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installation-projects'] });
      toast({
        title: "Prosjekt slettet",
        description: "Prosjektet har blitt slettet permanent",
      });
      navigate('/installations');
    },
    onError: (error: Error) => {
      toast({
        title: "Feil ved sletting",
        description: error.message,
        variant: "destructive"
      });
    }
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
      <div className="space-y-6 animate-fade-in p-6">
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
      <div className="space-y-6 animate-fade-in p-6">
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
    <div className="space-y-6 animate-fade-in p-6">
      {/* Header with project info and actions */}
      <div className="flex items-center justify-between">
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
        
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(project.status)}>
            {project.status}
          </Badge>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Slett prosjekt
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
                <AlertDialogDescription>
                  Dette vil permanent slette prosjektet "{project.project_name}" og alle tilknyttede data.
                  Denne handlingen kan ikke angres.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Avbryt</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => deleteProjectMutation.mutate(project.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Slett permanent
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Project details card */}
      <Card>
        <CardHeader>
          <CardTitle>Prosjektdetaljer</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Prosjektnavn</label>
            <p className="font-medium">{project.project_name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Kunde</label>
            <p>{project.customer_name || 'Ikke oppgitt'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Lokasjon</label>
            <p>{project.location || 'Ikke oppgitt'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Tekniker</label>
            <p>{project.assigned_technician?.name || 'Ikke tildelt'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <div className="mt-1">
              <ProjectStatusSelector 
                projectId={project.id}
                currentStatus={project.status}
                onStatusUpdate={() => queryClient.invalidateQueries({ queryKey: ['installation-project', id] })}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Opprettet</label>
            <p>{new Date(project.created_at).toLocaleDateString('no-NO')}</p>
          </div>
          {project.completed_at && (
            <div>
              <label className="text-sm font-medium text-gray-500">Fullført</label>
              <p>{new Date(project.completed_at).toLocaleDateString('no-NO')}</p>
            </div>
          )}
          {project.notes && (
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-500">Notater</label>
              <p className="whitespace-pre-wrap">{project.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs for checklist and gallery */}
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
