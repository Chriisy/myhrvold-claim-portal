
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
    // In a real implementation, this would upload to Supabase Storage
    // For now, we'll simulate the upload
    const mockFileUrl = `https://example.com/documents/${file.name}`;
    
    const { data, error } = await supabase
      .from('internal_control_documents')
      .insert({
        document_type: documentType,
        title,
        version,
        file_url: mockFileUrl,
        file_name: file.name,
        file_size: file.size,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Kunne ikke laste opp dokument: ${error.message}`);
    }

    return data;
  },

  async getDocuments(documentType?: string): Promise<InternalControlDocument[]> {
    let query = supabase
      .from('internal_control_documents')
      .select(`
        *,
        users!uploaded_by(name)
      `)
      .order('uploaded_at', { ascending: false });

    if (documentType) {
      query = query.eq('document_type', documentType);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Kunne ikke hente dokumenter: ${error.message}`);
    }

    return data || [];
  },

  async submitChecklist(
    documentType: string,
    title: string,
    checklistItems: ChecklistItem[]
  ) {
    const deviationsCount = checklistItems.filter(item => item.deviation).length;
    const status = deviationsCount > 0 ? 'completed_with_deviation' : 'completed';

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
        comments: checklistItems
          .filter(item => item.comment)
          .map(item => `${item.title}: ${item.comment}`)
          .join('; ')
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Kunne ikke lagre sjekkliste: ${error.message}`);
    }

    return data;
  },

  async getCheckHistory(): Promise<InternalControlCheck[]> {
    const { data, error } = await supabase
      .from('internal_control_checks')
      .select(`
        *,
        users!performed_by(name)
      `)
      .order('date_performed', { ascending: false });

    if (error) {
      throw new Error(`Kunne ikke hente historikk: ${error.message}`);
    }

    return data || [];
  }
};
