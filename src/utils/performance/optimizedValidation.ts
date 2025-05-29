
import { z } from 'zod';

// Optimized validation schemas with better error messages
export const claimValidationSchema = z.object({
  customer_name: z
    .string()
    .min(1, 'Kundenavn er påkrevd')
    .max(100, 'Kundenavn kan ikke være lengre enn 100 tegn'),
  
  machine_model: z
    .string()
    .min(1, 'Maskinmodell er påkrevd')
    .max(50, 'Maskinmodell kan ikke være lengre enn 50 tegn'),
  
  part_number: z
    .string()
    .optional()
    .refine(val => !val || val.length <= 50, 'Delenummer kan ikke være lengre enn 50 tegn'),
  
  description: z
    .string()
    .min(10, 'Beskrivelse må være minst 10 tegn')
    .max(1000, 'Beskrivelse kan ikke være lengre enn 1000 tegn'),
  
  supplier_id: z
    .string()
    .uuid('Ugyldig leverandør valgt'),
  
  technician_id: z
    .string()
    .uuid('Ugyldig tekniker valgt')
    .optional(),
  
  quantity: z
    .number()
    .min(1, 'Antall må være minst 1')
    .max(10000, 'Antall kan ikke være mer enn 10000')
    .optional(),
  
  warranty: z.boolean().default(false),
});

export const supplierValidationSchema = z.object({
  name: z
    .string()
    .min(1, 'Leverandørnavn er påkrevd')
    .max(100, 'Leverandørnavn kan ikke være lengre enn 100 tegn'),
  
  contact_name: z
    .string()
    .min(1, 'Kontaktperson er påkrevd')
    .max(100, 'Kontaktperson kan ikke være lengre enn 100 tegn')
    .optional(),
  
  contact_email: z
    .string()
    .email('Ugyldig e-postadresse')
    .optional()
    .or(z.literal('')),
  
  contact_phone: z
    .string()
    .regex(/^[\+]?[0-9\s\-\(\)]{8,15}$/, 'Ugyldig telefonnummer')
    .optional()
    .or(z.literal('')),
});

export const userValidationSchema = z.object({
  name: z
    .string()
    .min(1, 'Navn er påkrevd')
    .max(100, 'Navn kan ikke være lengre enn 100 tegn'),
  
  email: z
    .string()
    .email('Ugyldig e-postadresse')
    .min(1, 'E-post er påkrevd'),
  
  user_role: z.enum(['admin', 'tekniker', 'leder'], {
    errorMap: () => ({ message: 'Ugyldig brukerrolle' })
  }),
  
  department: z.enum(['oslo', 'stavanger', 'trondheim', 'bergen'], {
    errorMap: () => ({ message: 'Ugyldig avdeling' })
  }),
  
  seller_no: z
    .number()
    .min(1, 'Selgernummer må være større enn 0')
    .max(9999, 'Selgernummer kan ikke være større enn 9999')
    .optional(),
});

export const certificateValidationSchema = z.object({
  certificate_type: z.enum(['personal', 'company'], {
    errorMap: () => ({ message: 'Ugyldig sertifikattype' })
  }),
  
  certificate_number: z
    .string()
    .min(1, 'Sertifikatnummer er påkrevd')
    .max(50, 'Sertifikatnummer kan ikke være lengre enn 50 tegn'),
  
  holder_name: z
    .string()
    .min(1, 'Innehavernavn er påkrevd')
    .max(100, 'Innehavernavn kan ikke være lengre enn 100 tegn')
    .optional(),
  
  issue_date: z
    .date()
    .max(new Date(), 'Utstedelsesdato kan ikke være i fremtiden'),
  
  expiry_date: z
    .date()
    .min(new Date(), 'Utløpsdato må være i fremtiden'),
  
  issuing_authority: z
    .string()
    .min(1, 'Utstedende myndighet er påkrevd')
    .max(100, 'Utstedende myndighet kan ikke være lengre enn 100 tegn')
    .optional(),
});

// Validation utility functions
export const validateWithFeedback = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: boolean; data?: T; errors?: string[] } => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      );
      return { success: false, errors };
    }
    return { success: false, errors: ['Ukjent valideringsfeil'] };
  }
};

export const getFieldError = (
  errors: z.ZodError | undefined,
  fieldName: string
): string | undefined => {
  return errors?.errors.find(err => 
    err.path.join('.') === fieldName
  )?.message;
};
