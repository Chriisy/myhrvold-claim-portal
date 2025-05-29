
import { Database } from '@/integrations/supabase/types';

export type ClaimCategory = Database['public']['Enums']['claim_category'];
export type ClaimStatus = Database['public']['Enums']['claim_status'];
export type ActionStatus = Database['public']['Enums']['action_status'];

export interface ClaimFormData {
  // Step 1: Customer & Equipment
  customer_name: string;
  customer_no?: string;
  customer_address?: string;
  customer_postal_code?: string;
  customer_city?: string;
  department?: string;
  machine_model?: string;
  machine_serial?: string;
  part_number?: string;
  warranty: boolean;
  quantity?: number;
  
  // Step 2: Category & Supplier
  category?: ClaimCategory;
  supplier_id?: string;
  technician_id?: string;
  salesperson_id?: string;
  
  // Step 3: Description & References
  description: string;
  visma_order_no?: string;
  customer_po?: string;
  reported_by?: string;
  internal_note?: string;
  
  // Step 4: Files (optional)
  files?: File[];
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

export interface ClaimFile {
  id: string;
  claim_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  file_url: string;
  created_at: string;
}

// Enhanced claim interface with display_id
export interface ClaimWithDisplayId {
  id: string;
  display_id?: string;
  customer_name?: string;
  machine_model?: string;
  part_number?: string;
  status?: string;
  category?: string | null;
  created_at: string;
  created_by?: string;
  suppliers?: { name: string } | null;
  technician?: { name: string } | null;
  salesperson?: { name: string } | null;
  totalCost?: number;
}
