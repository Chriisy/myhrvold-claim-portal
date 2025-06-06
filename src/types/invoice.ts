
export interface ParsedInvoiceLine {
  description: string;
  amount: number;
  konto: number;
  voucher: string;
  [key: string]: string | number; // Add index signature for Json compatibility
}

export interface MappedInvoiceLine extends ParsedInvoiceLine {
  type: 'cost' | 'credit';
  claim_id?: string;
  note?: string;
}

export interface ImportedFile {
  id: string;
  filename: string;
  uploadedAt: string;
  lines: ParsedInvoiceLine[];
}

export interface ImportResult {
  success: boolean;
  claimId?: string;
  message: string;
}
