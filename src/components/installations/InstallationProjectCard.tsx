
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, User, Calendar, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface InstallationProject {
  id: string;
  project_name: string;
  customer_name: string | null;
  location: string | null;
  status: 'Ny' | 'Påbegynt' | 'Ferdig' | 'Avvik';
  assigned_technician_id: string | null;
  created_at: string;
  assigned_technician?: {
    name: string;
  };
}

interface InstallationProjectCardProps {
  project: InstallationProject;
  onUpdate: () => void;
}

export const InstallationProjectCard = ({ project, onUpdate }: InstallationProjectCardProps) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ny': return 'bg-blue-100 text-blue-800';
      case 'Påbegynt': return 'bg-yellow-100 text-yellow-800';
      case 'Ferdig': return 'bg-green-100 text-green-800';
      case 'Avvik': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleOpenProject = () => {
    navigate(`/installations/${project.id}`);
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleOpenProject}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-medium">{project.project_name}</CardTitle>
          <Badge className={getStatusColor(project.status)}>
            {project.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {project.customer_name && (
          <div className="flex items-center text-sm text-gray-600">
            <User className="w-4 h-4 mr-2" />
            {project.customer_name}
          </div>
        )}
        
        {project.location && (
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            {project.location}
          </div>
        )}

        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          {new Date(project.created_at).toLocaleDateString('nb-NO')}
        </div>

        {project.assigned_technician && (
          <div className="text-sm">
            <span className="text-gray-600">Montør: </span>
            <span className="font-medium">{project.assigned_technician.name}</span>
          </div>
        )}

        <Button variant="outline" size="sm" className="w-full mt-3" onClick={(e) => {
          e.stopPropagation();
          handleOpenProject();
        }}>
          <ExternalLink className="w-4 h-4 mr-2" />
          Åpne Prosjekt
        </Button>
      </CardContent>
    </Card>
  );
};
