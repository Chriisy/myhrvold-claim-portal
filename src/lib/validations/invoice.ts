
import { z } from 'zod';

export const parsedInvoiceLineSchema = z.object({
  description: z.string().min(1, 'Beskrivelse er påkrevd'),
  amount: z.number().min(0.01, 'Beløp må være større enn 0'),
  voucher: z.string().optional(),
  konto: z.number().int().positive().optional(),
});

export const mappedInvoiceLineSchema = parsedInvoiceLineSchema.extend({
  claim_id: z.string().uuid('Ugyldig reklamasjon ID'),
  type: z.enum(['cost', 'credit'], { required_error: 'Type må velges' }),
  note: z.string().optional(),
});

export type ParsedInvoiceLineData = z.infer<typeof parsedInvoiceLineSchema>;
export type MappedInvoiceLineData = z.infer<typeof mappedInvoiceLineSchema>;
