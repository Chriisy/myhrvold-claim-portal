
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { maintenanceService } from '@/services/maintenanceService';
import { toast } from '@/hooks/use-toast';

export const useMaintenanceEquipment = () => {
  return useQuery({
    queryKey: ['maintenance-equipment'],
    queryFn: () => maintenanceService.getEquipment(),
  });
};

export const useMaintenanceChecklists = () => {
  return useQuery({
    queryKey: ['maintenance-checklists'],
    queryFn: () => maintenanceService.getChecklists(),
  });
};

export const useMaintenanceChecklist = (checklistId: string) => {
  return useQuery({
    queryKey: ['maintenance-checklist', checklistId],
    queryFn: () => maintenanceService.getChecklistWithRows(checklistId),
    enabled: !!checklistId,
  });
};

export const useCreateMaintenanceChecklist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: maintenanceService.createChecklist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-checklists'] });
      toast({
        title: "Vedlikeholdsjournal opprettet",
        description: "Den nye vedlikeholdsjournalen er tilgjengelig",
      });
    },
    onError: (error) => {
      toast({
        title: "Feil ved opprettelse",
        description: "Kunne ikke opprette vedlikeholdsjournal",
        variant: "destructive",
      });
    },
  });
};

export const useAddEquipmentToChecklist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ checklistId, equipmentId, idNumberOverride }: {
      checklistId: string;
      equipmentId: string;
      idNumberOverride?: string;
    }) => maintenanceService.addEquipmentToChecklist(checklistId, equipmentId, idNumberOverride),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-checklist', variables.checklistId] });
    },
  });
};

export const useAddMaintenanceControl = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rowId, controlNo, controlDate, signature }: {
      rowId: string;
      controlNo: number;
      controlDate?: string;
      signature?: string;
    }) => maintenanceService.addControl(rowId, controlNo, controlDate, signature),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-checklist'] });
    },
  });
};

export const useUpdateMaintenanceControl = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ controlId, controlDate, signature }: {
      controlId: string;
      controlDate?: string;
      signature?: string;
    }) => maintenanceService.updateControl(controlId, controlDate, signature),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-checklist'] });
    },
  });
};
