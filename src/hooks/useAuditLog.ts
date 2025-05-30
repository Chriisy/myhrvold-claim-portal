
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface AuditLogEntry {
  id: string;
  user_id: string;
  action: string;
  table_name?: string;
  record_id?: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export const useAuditLog = () => {
  return useQuery({
    queryKey: ['audit-log'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as AuditLogEntry[];
    },
  });
};

export const useCreateAuditLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      action, 
      tableName, 
      recordId, 
      oldValues, 
      newValues 
    }: { 
      action: string; 
      tableName?: string; 
      recordId?: string; 
      oldValues?: any; 
      newValues?: any; 
    }) => {
      const { data, error } = await supabase
        .from('audit_log')
        .insert({
          action,
          table_name: tableName,
          record_id: recordId,
          old_values: oldValues,
          new_values: newValues,
          user_agent: navigator.userAgent,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-log'] });
    },
    onError: (error) => {
      console.error('Error creating audit log:', error);
    },
  });
};
