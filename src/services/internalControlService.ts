
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

export const internalControlService = {
  async uploadDocument(file: File, documentType: string, title: string, version: string) {
    console.log('Uploading document:', { file: file.name, documentType, title, version });
    
    // TODO: Implement real file upload to Supabase Storage when tables are created
    // For now, return a simulated response until the database migration is complete
    return {
      id: crypto.randomUUID(),
      document_type: documentType,
      title,
      version,
      file_url: `https://example.com/documents/${file.name}`,
      file_name: file.name,
      file_size: file.size,
      uploaded_by: 'current-user-id',
      uploaded_at: new Date().toISOString()
    };
  },

  async getDocuments(documentType?: string): Promise<InternalControlDocument[]> {
    console.log('Getting documents for type:', documentType);
    
    // TODO: Replace with real database query when tables are created
    // const { data, error } = await supabase
    //   .from('internal_control_documents')
    //   .select('*')
    //   .eq(documentType ? 'document_type' : undefined, documentType);
    
    // For now, return empty array until database is properly set up
    return [];
  },

  async submitChecklist(
    documentType: string,
    title: string,
    checklistItems: ChecklistItem[]
  ) {
    console.log('Submitting checklist:', { documentType, title, checklistItems });
    
    const deviationsCount = checklistItems.filter(item => item.deviation).length;
    const status = deviationsCount > 0 ? 'completed_with_deviation' : 'completed';

    // TODO: Replace with real database insert when tables are created
    // const { data, error } = await supabase
    //   .from('internal_control_checks')
    //   .insert({
    //     document_type: documentType,
    //     title,
    //     date_performed: new Date().toISOString().split('T')[0],
    //     performed_by: 'current-user-id',
    //     status,
    //     deviations_count: deviationsCount,
    //     checklist_data: checklistItems,
    //     comments: checklistItems
    //       .filter(item => item.comment)
    //       .map(item => `${item.title}: ${item.comment}`)
    //       .join('; ')
    //   });

    return {
      id: crypto.randomUUID(),
      document_type: documentType,
      title,
      date_performed: new Date().toISOString().split('T')[0],
      performed_by: 'current-user-id',
      status,
      deviations_count: deviationsCount,
      checklist_data: checklistItems,
      comments: checklistItems
        .filter(item => item.comment)
        .map(item => `${item.title}: ${item.comment}`)
        .join('; ')
    };
  },

  async getCheckHistory(): Promise<InternalControlCheck[]> {
    console.log('Getting check history');
    
    // TODO: Replace with real database query when tables are created
    // const { data, error } = await supabase
    //   .from('internal_control_checks')
    //   .select('*')
    //   .order('date_performed', { ascending: false });
    
    // For now, return empty array until database is properly set up
    return [];
  }
};
