
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ProjectStatusSelectorProps {
  projectId: string;
  currentStatus: string;
  onStatusUpdate: () => void;
}

const statusOptions = [
  { value: 'Ny', label: 'Ny', color: 'bg-blue-100 text-blue-800' },
  { value: 'Påbegynt', label: 'Påbegynt', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'Ferdig', label: 'Ferdig', color: 'bg-green-100 text-green-800' },
  { value: 'Avvik', label: 'Avvik', color: 'bg-red-100 text-red-800' }
];

export const ProjectStatusSelector = ({ projectId, currentStatus, onStatusUpdate }: ProjectStatusSelectorProps) => {
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const { error } = await supabase
        .from('installation_projects')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString(),
          ...(newStatus === 'Ferdig' ? { completed_at: new Date().toISOString() } : {})
        })
        .eq('id', projectId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installation-project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['installation-projects'] });
      onStatusUpdate();
      toast({
        title: "Status oppdatert",
        description: "Prosjektstatus har blitt oppdatert",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Feil ved oppdatering",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleStatusChange = (newStatus: string) => {
    updateStatusMutation.mutate(newStatus);
  };

  const currentStatusOption = statusOptions.find(option => option.value === currentStatus);

  return (
    <Select 
      value={currentStatus} 
      onValueChange={handleStatusChange}
      disabled={updateStatusMutation.isPending}
    >
      <SelectTrigger className="w-40">
        <SelectValue>
          {currentStatusOption && (
            <Badge className={currentStatusOption.color}>
              {currentStatusOption.label}
            </Badge>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <Badge className={option.color}>
              {option.label}
            </Badge>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
