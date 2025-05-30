import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ErrorHandlers, RetryService } from '@/services/errorHandling';
import { useRef, useCallback, useEffect } from 'react';

interface ChecklistItem {
  id: string;
  text: string;
  required: boolean;
  completed: boolean;
  comments: string;
  photos: string[];
}

interface Deviation {
  id: string;
  category: string;
  severity: 'lav' | 'medium' | 'høy' | 'kritisk';
  description: string;
  action_required: string;
  created_at: string;
}

export const useInstallationChecklist = (projectId: string) => {
  const queryClient = useQueryClient();
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<string>('');

  const { data: checklist, isLoading, error } = useQuery({
    queryKey: ['installation-checklist', projectId],
    queryFn: async () => {
      try {
        // First try to get existing checklist
        const { data: existing } = await supabase
          .from('installation_checklists')
          .select('*')
          .eq('project_id', projectId)
          .single();

        if (existing) {
          return existing;
        }

        const { data: template } = await supabase
          .from('checklist_templates')
          .select('*')
          .eq('is_active', true)
          .limit(1)
          .single();

        if (!template) {
          throw new Error('Ingen aktiv sjekkliste-mal funnet');
        }

        const { data: user } = await supabase.auth.getUser();
        if (!user.user) throw new Error('Ikke innlogget');

        const { data: newChecklist, error } = await supabase
          .from('installation_checklists')
          .insert({
            project_id: projectId,
            template_id: template.id,
            checklist_data: template.checklist_items
          })
          .select()
          .single();

        if (error) throw error;
        return newChecklist;
      } catch (error) {
        ErrorHandlers.handleSupabaseError(error as any, 'laste sjekkliste', {
          component: 'useInstallationChecklist',
          severity: 'high'
        });
        throw error;
      }
    },
    enabled: !!projectId,
    retry: (failureCount, error) => RetryService.shouldRetryQuery(failureCount, error),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const updateChecklistMutation = useMutation({
    mutationFn: async ({ updates, skipToast = false }: { updates: any; skipToast?: boolean }) => {
      try {
        // Create a hash of the updates to prevent duplicate operations
        const updateHash = JSON.stringify(updates);
        if (updateHash === lastUpdateRef.current) {
          return; // Skip duplicate update
        }
        lastUpdateRef.current = updateHash;

        const { error } = await supabase
          .from('installation_checklists')
          .update(updates)
          .eq('project_id', projectId);

        if (error) throw error;
        return { skipToast };
      } catch (error) {
        ErrorHandlers.handleSupabaseError(error as any, 'oppdatere sjekkliste', {
          component: 'useInstallationChecklist',
          severity: 'medium'
        });
        throw error;
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['installation-checklist', projectId] });
      
      // Only show toast if not explicitly skipped
      if (!result?.skipToast) {
        toast({
          title: "Sjekkliste oppdatert",
          description: "Endringen er lagret",
        });
      }
    },
    onError: (error) => {
      console.error('Checklist update error:', error);
      toast({
        title: "Feil",
        description: "Kunne ikke oppdatere sjekkliste",
        variant: "destructive"
      });
    }
  });

  const debouncedUpdate = useCallback((updates: any, delay = 1000) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      updateChecklistMutation.mutate({ updates, skipToast: false });
    }, delay);
  }, [updateChecklistMutation]);

  const toggleItem = useCallback((itemId: string) => {
    if (!checklist) return;

    const items = checklist.checklist_data as unknown as ChecklistItem[];
    const updatedItems = items.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    // Immediate update for UI responsiveness
    updateChecklistMutation.mutate({ 
      updates: { checklist_data: updatedItems as any },
      skipToast: false
    });
  }, [checklist, updateChecklistMutation]);

  const updateComment = useCallback((itemId: string, comments: string) => {
    if (!checklist) return;

    const items = checklist.checklist_data as unknown as ChecklistItem[];
    const updatedItems = items.map(item =>
      item.id === itemId ? { ...item, comments } : item
    );

    // Use debounced update for comments to avoid spam
    debouncedUpdate({ checklist_data: updatedItems as any });
  }, [checklist, debouncedUpdate]);

  const updateInternalNotes = useCallback((notes: string) => {
    // Use debounced update for internal notes
    debouncedUpdate({ internal_notes: notes });
  }, [debouncedUpdate]);

  const addDeviation = useCallback((deviation: Omit<Deviation, 'id' | 'created_at'>) => {
    if (!checklist) return;

    const currentDeviations = (checklist.deviation_notes as unknown as Deviation[]) || [];
    const newDeviation: Deviation = {
      ...deviation,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };

    const updatedDeviations = [...currentDeviations, newDeviation];
    
    updateChecklistMutation.mutate({ 
      updates: { deviation_notes: updatedDeviations as any },
      skipToast: false
    });

    toast({
      title: "Avvik registrert",
      description: "Avviket er lagt til"
    });
  }, [checklist, updateChecklistMutation]);

  const removeDeviation = useCallback((deviationId: string) => {
    if (!checklist) return;

    const currentDeviations = (checklist.deviation_notes as unknown as Deviation[]) || [];
    const updatedDeviations = currentDeviations.filter(d => d.id !== deviationId);
    
    updateChecklistMutation.mutate({ 
      updates: { deviation_notes: updatedDeviations as any },
      skipToast: false
    });
  }, [checklist, updateChecklistMutation]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  return {
    checklist,
    isLoading,
    error,
    toggleItem,
    updateComment,
    updateInternalNotes,
    addDeviation,
    removeDeviation,
    isUpdating: updateChecklistMutation.isPending
  };
};
