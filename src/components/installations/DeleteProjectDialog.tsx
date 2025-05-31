
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface DeleteProjectDialogProps {
  projectId: string;
  projectName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeleteProjectDialog = ({ projectId, projectName, open, onOpenChange }: DeleteProjectDialogProps) => {
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('installation_projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      toast({
        title: "Prosjekt slettet",
        description: `${projectName} er slettet`,
      });

      navigate('/installations');
    } catch (error: any) {
      toast({
        title: "Feil",
        description: "Kunne ikke slette prosjekt",
        variant: "destructive"
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-500" />
            Slett prosjekt
          </AlertDialogTitle>
          <AlertDialogDescription>
            Er du sikker på at du vil slette prosjektet "{projectName}"? 
            Denne handlingen kan ikke angres.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Avbryt</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
            Slett prosjekt
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
