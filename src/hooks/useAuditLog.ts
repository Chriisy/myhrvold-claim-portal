
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AuditLogEntry {
  action: string;
  tableName: string;
  recordId: string;
  oldValues?: any;
  newValues?: any;
}

export const useCreateAuditLog = () => {
  return useMutation({
    mutationFn: async (logEntry: AuditLogEntry) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('audit_log')
        .insert({
          action: logEntry.action,
          table_name: logEntry.tableName,
          record_id: logEntry.recordId,
          old_values: logEntry.oldValues,
          new_values: logEntry.newValues,
          user_id: user?.id
        });

      if (error) throw error;
    },
    onError: (error) => {
      console.error('Error creating audit log:', error);
      // Don't show toast for audit log errors to avoid spamming user
    }
  });
};
