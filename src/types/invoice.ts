
export interface ParsedInvoiceLine {
  description: string;
  amount: number;
  voucher?: string;
  konto?: number;
}

export interface InvoiceImportData {
  id: string;
  file_id: string;
  meta_json: {
    filename?: string;
    uploaded_at?: string;
    lines?: ParsedInvoiceLine[];
    error?: string;
  };
  status: 'validating' | 'ready' | 'error';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface MappedInvoiceLine extends ParsedInvoiceLine {
  claim_id?: string;
  type: 'cost' | 'credit';
  note?: string;
}
