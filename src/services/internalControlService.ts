
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
    // Simulation since the table doesn't exist yet
    console.log('Uploading document:', { file: file.name, documentType, title, version });
    
    // Return simulated data
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
    
    // Return simulated data until the real table is created
    const mockDocuments: InternalControlDocument[] = [
      {
        id: '1',
        document_type: 'lekkasjekontroll',
        title: 'Rutine for lekkasjekontroll 2025',
        version: '1.0',
        file_url: 'https://example.com/documents/lekkasjekontroll.pdf',
        file_name: 'lekkasjekontroll.pdf',
        file_size: 1024000,
        uploaded_by: 'admin',
        uploaded_at: '2025-01-28T10:00:00Z'
      },
      {
        id: '2',
        document_type: 'tomming_gjenvinning',
        title: 'Rutine for tømming og gjenvinning',
        version: '1.1',
        file_url: 'https://example.com/documents/tomming.pdf',
        file_name: 'tomming.pdf',
        file_size: 856000,
        uploaded_by: 'admin',
        uploaded_at: '2025-01-20T14:30:00Z'
      }
    ];

    if (documentType) {
      return mockDocuments.filter(doc => doc.document_type === documentType);
    }
    
    return mockDocuments;
  },

  async submitChecklist(
    documentType: string,
    title: string,
    checklistItems: ChecklistItem[]
  ) {
    console.log('Submitting checklist:', { documentType, title, checklistItems });
    
    const deviationsCount = checklistItems.filter(item => item.deviation).length;
    const status = deviationsCount > 0 ? 'completed_with_deviation' : 'completed';

    // Return simulated data
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
    
    // Return simulated data
    return [
      {
        id: '1',
        document_type: 'lekkasjekontroll',
        title: 'Lekkasjekontroll - Anlegg A',
        date_performed: '2025-01-25',
        performed_by: 'Ola Hansen',
        status: 'completed',
        deviations_count: 0,
        comments: 'Alle kontroller OK',
        checklist_data: []
      },
      {
        id: '2',
        document_type: 'tomming_gjenvinning',
        title: 'Tømming og gjenvinning - Anlegg B',
        date_performed: '2025-01-20',
        performed_by: 'Kari Normann',
        status: 'completed_with_deviation',
        deviations_count: 1,
        comments: 'Ventil defekt - utskiftet',
        checklist_data: []
      }
    ];
  }
};
