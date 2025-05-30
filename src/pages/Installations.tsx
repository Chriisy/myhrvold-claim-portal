
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, MapPin, User, Calendar } from 'lucide-react';
import { InstallationProjectCard } from '@/components/installations/InstallationProjectCard';
import { CreateProjectDialog } from '@/components/installations/CreateProjectDialog';

interface InstallationProject {
  id: string;
  project_name: string;
  customer_name: string | null;
  location: string | null;
  status: 'Ny' | 'Påbegynt' | 'Ferdig' | 'Avvik';
  assigned_technician_id: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  notes: string | null;
  assigned_technician?: {
    name: string;
  };
}

const fetchInstallationProjects = async () => {
  const { data, error } = await supabase
    .from('installation_projects')
    .select(`
      *,
      assigned_technician:users!assigned_technician_id(name)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as InstallationProject[];
};

const Installations = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Prefetch data function
  const prefetchInstallations = () => {
    queryClient.prefetchQuery({
      queryKey: ['installation-projects'],
      queryFn: fetchInstallationProjects,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  const { data: projects, isLoading, refetch } = useQuery({
    queryKey: ['installation-projects'],
    queryFn: fetchInstallationProjects,
    staleTime: 5 * 60 * 1000, // 5 minutes
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
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 
            className="text-3xl font-bold"
            onMouseEnter={prefetchInstallations}
            onFocus={prefetchInstallations}
          >
            Installasjoner
          </h1>
          <p className="text-gray-600">Administrer installasjonprosjekter og sjekklister</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nytt Prosjekt
        </Button>
      </div>

      {projects && projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium">Ingen prosjekter ennå</h3>
              <p className="text-gray-600">Kom i gang ved å opprette ditt første installasjonprosjekt</p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Opprett Prosjekt
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects?.map((project) => (
            <InstallationProjectCard
              key={project.id}
              project={project}
              onUpdate={refetch}
            />
          ))}
        </div>
      )}

      <CreateProjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onProjectCreated={refetch}
      />
    </div>
  );
};

export default Installations;
