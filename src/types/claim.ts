
import { Database } from '@/integrations/supabase/types';

export type ClaimCategory = Database['public']['Enums']['claim_category'];
export type ClaimStatus = Database['public']['Enums']['claim_status'];

export interface ClaimFormData {
  // Step 1: Customer & Equipment
  customer_name: string;
  customer_no?: string;
  customer_address?: string;
  department?: string;
  machine_model?: string;
  machine_serial?: string;
  part_number?: string;
  warranty: boolean;
  quantity?: number;
  
  // Step 2: Category & Supplier
  category?: ClaimCategory;
  supplier_id?: string;
  
  // Step 3: Description & References
  description: string;
  visma_order_no?: string;
  customer_po?: string;
  reported_by?: string;
  internal_note?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
}

export interface NewSupplierData {
  name: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
}
