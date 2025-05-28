
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { internalControlService, ChecklistItem } from '@/services/internalControlService';
import { toast } from '@/hooks/use-toast';

export const useInternalControlDocuments = (documentType?: string) => {
  return useQuery({
    queryKey: ['internal-control-documents', documentType],
    queryFn: () => internalControlService.getDocuments(documentType),
  });
};

export const useInternalControlHistory = () => {
  return useQuery({
    queryKey: ['internal-control-history'],
    queryFn: () => internalControlService.getCheckHistory(),
  });
};

export const useChecklistTemplates = (documentType?: string) => {
  return useQuery({
    queryKey: ['checklist-templates', documentType],
    queryFn: () => internalControlService.getChecklistTemplates(documentType),
  });
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      file, 
      documentType, 
      title, 
      version 
    }: { 
      file: File; 
      documentType: string; 
      title: string; 
      version: string; 
    }) => internalControlService.uploadDocument(file, documentType, title, version),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal-control-documents'] });
      toast({
        title: "Dokumentet er lastet opp",
        description: "Rutinedokumentet er nå tilgjengelig i systemet",
      });
    },
    onError: (error) => {
      toast({
        title: "Feil ved opplasting",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useSubmitChecklist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      documentType, 
      title, 
      checklistItems 
    }: { 
      documentType: string; 
      title: string; 
      checklistItems: ChecklistItem[]; 
    }) => internalControlService.submitChecklist(documentType, title, checklistItems),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal-control-history'] });
      toast({
        title: "Sjekkliste fullført",
        description: "Kontrollen er registrert i systemet",
      });
    },
    onError: (error) => {
      toast({
        title: "Feil ved lagring",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
