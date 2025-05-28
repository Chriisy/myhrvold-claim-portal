
import { supabase } from '@/integrations/supabase/client';

export interface InternalControlDocument {
  id: string;
  document_type: string;
  title: string;
  version: string;
  file_url: string;
  file_name: string;
  file_size: number;
  uploaded_by: string;
  uploaded_at: string;
}

export interface InternalControlCheck {
  id: string;
  document_type: string;
  title: string;
  date_performed: string;
  performed_by: string;
  status: 'completed' | 'completed_with_deviation';
  deviations_count: number;
  comments?: string;
  checklist_data: any[];
}

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  deviation: boolean;
  comment?: string;
}

export interface ChecklistTemplate {
  id: string;
  document_type: string;
  title: string;
  description?: string;
  checklist_items: any[];
  is_active: boolean;
}

export const internalControlService = {
  async uploadDocument(file: File, documentType: string, title: string, version: string) {
    console.log('Uploading document:', { file: file.name, documentType, title, version });
    
    try {
      // For now, we'll simulate file upload since storage isn't set up yet
      // In production, you would upload to Supabase Storage first
      const fileUrl = `https://example.com/documents/${file.name}`;
      const filePath = `internal-control/${documentType}/${file.name}`;

      const { data, error } = await supabase
        .from('internal_control_documents')
        .insert({
          document_type: documentType,
          title,
          version,
          file_url: fileUrl,
          file_name: file.name,
          file_size: file.size,
          file_path: filePath,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        document_type: data.document_type,
        title: data.title,
        version: data.version,
        file_url: data.file_url,
        file_name: data.file_name,
        file_size: data.file_size,
        uploaded_by: data.uploaded_by,
        uploaded_at: data.uploaded_at
      };
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  async getDocuments(documentType?: string): Promise<InternalControlDocument[]> {
    console.log('Getting documents for type:', documentType);
    
    try {
      let query = supabase
        .from('internal_control_documents')
        .select(`
          id,
          document_type,
          title,
          version,
          file_url,
          file_name,
          file_size,
          uploaded_by,
          uploaded_at
        `)
        .order('uploaded_at', { ascending: false });

      if (documentType) {
        query = query.eq('document_type', documentType);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
  },

  async getChecklistTemplates(documentType?: string): Promise<ChecklistTemplate[]> {
    console.log('Getting checklist templates for type:', documentType);
    
    try {
      let query = supabase
        .from('internal_control_checklists')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (documentType) {
        query = query.eq('document_type', documentType);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching checklist templates:', error);
      return [];
    }
  },

  async submitChecklist(
    documentType: string,
    title: string,
    checklistItems: ChecklistItem[]
  ) {
    console.log('Submitting checklist:', { documentType, title, checklistItems });
    
    try {
      const deviationsCount = checklistItems.filter(item => item.deviation).length;
      const status = deviationsCount > 0 ? 'completed_with_deviation' : 'completed';
      const comments = checklistItems
        .filter(item => item.comment)
        .map(item => `${item.title}: ${item.comment}`)
        .join('; ');

      const { data, error } = await supabase
        .from('internal_control_checks')
        .insert({
          document_type: documentType,
          title,
          date_performed: new Date().toISOString().split('T')[0],
          performed_by: (await supabase.auth.getUser()).data.user?.id,
          status,
          deviations_count: deviationsCount,
          checklist_data: checklistItems,
          comments: comments || null
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        document_type: data.document_type,
        title: data.title,
        date_performed: data.date_performed,
        performed_by: data.performed_by,
        status: data.status,
        deviations_count: data.deviations_count,
        checklist_data: data.checklist_data,
        comments: data.comments
      };
    } catch (error) {
      console.error('Error submitting checklist:', error);
      throw error;
    }
  },

  async getCheckHistory(): Promise<InternalControlCheck[]> {
    console.log('Getting check history');
    
    try {
      const { data, error } = await supabase
        .from('internal_control_checks')
        .select(`
          id,
          document_type,
          title,
          date_performed,
          performed_by,
          status,
          deviations_count,
          comments,
          checklist_data
        `)
        .order('date_performed', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching check history:', error);
      return [];
    }
  }
};
