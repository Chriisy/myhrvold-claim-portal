
import { z } from 'zod';

export const claimFormSchema = z.object({
  // Step 1: Customer & Equipment
  customer_name: z.string().min(1, 'Kundenavn er påkrevd'),
  customer_no: z.string().optional(),
  department: z.string().optional(),
  machine_model: z.string().optional(),
  machine_serial: z.string().optional(),
  warranty: z.boolean().default(false),
  quantity: z.number().positive().optional(),
  
  // Step 2: Category & Supplier
  category: z.enum(['ServiceJobb', 'Installasjon', 'Montasje', 'Produkt', 'Del']).optional(),
  supplier_id: z.string().uuid().optional(),
  
  // Step 3: Description & References
  description: z.string().min(1, 'Beskrivelse er påkrevd'),
  visma_order_no: z.string().optional(),
  customer_po: z.string().optional(),
  reported_by: z.string().optional(),
  internal_note: z.string().optional(),
});

export const newSupplierSchema = z.object({
  name: z.string().min(1, 'Leverandørnavn er påkrevd'),
  contact_name: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email('Ugyldig e-postadresse').optional().or(z.literal('')),
});

export type ClaimFormData = z.infer<typeof claimFormSchema>;
export type NewSupplierData = z.infer<typeof newSupplierSchema>;
