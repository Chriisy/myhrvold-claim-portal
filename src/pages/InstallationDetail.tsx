
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, User, Calendar, FileText } from 'lucide-react';
import { InstallationChecklist } from '@/components/installations/InstallationChecklist';

const InstallationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: project, isLoading } = useQuery({
    queryKey: ['installation-project', id],
    queryFn: async () => {
      if (!id) throw new Error('No project ID');

      const { data, error } = await supabase
        .from('installation_projects')
        .select(`
          *,
          assigned_technician:users!assigned_technician_id(name),
          created_by_user:users!created_by(name)
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
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Prosjekt ikke funnet</h2>
          <Button onClick={() => navigate('/installations')} className="mt-4">
            Tilbake til oversikt
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate('/installations')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Tilbake
        </Button>
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold">{project.project_name}</h1>
            <Badge className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Prosjektinfo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.customer_name && (
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Kunde:</span>
                  <span className="text-sm">{project.customer_name}</span>
                </div>
              )}

              {project.location && (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Lokasjon:</span>
                  <span className="text-sm">{project.location}</span>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">Opprettet:</span>
                <span className="text-sm">{new Date(project.created_at).toLocaleDateString('nb-NO')}</span>
              </div>

              {project.assigned_technician && (
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Montør:</span>
                  <span className="text-sm">{project.assigned_technician.name}</span>
                </div>
              )}

              {project.notes && (
                <div className="pt-2 border-t">
                  <div className="flex items-start space-x-2">
                    <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <span className="text-sm font-medium block">Notater:</span>
                      <span className="text-sm text-gray-600">{project.notes}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <InstallationChecklist projectId={project.id} />
        </div>
      </div>
    </div>
  );
};

export default InstallationDetail;
