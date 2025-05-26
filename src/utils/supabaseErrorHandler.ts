
import { PostgrestError } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

export interface SupabaseErrorDetails {
  code?: string;
  message: string;
  details?: string;
  hint?: string;
}

export function handleSupabaseError(error: PostgrestError | Error, operation: string): SupabaseErrorDetails {
  console.error(`Supabase error during ${operation}:`, error);
  
  let userMessage = `Kunne ikke ${operation}`;
  let details = '';
  
  if ('code' in error) {
    // PostgrestError
    switch (error.code) {
      case 'PGRST116':
        userMessage = 'Ingen data funnet';
        break;
      case '42501':
        userMessage = 'Du har ikke tilgang til denne operasjonen';
        break;
      case '23505':
        userMessage = 'Denne oppføringen eksisterer allerede';
        break;
      case '23503':
        userMessage = 'Kan ikke slette - det finnes relaterte data';
        break;
      case 'PGRST301':
        userMessage = 'Database forbindelse feilet';
        break;
      case '42P17':
        userMessage = 'Database konfigurasjonsfeil - kontakt administrator';
        break;
      case '22P02':
        if (error.message?.includes('enum claim_status')) {
          userMessage = 'Ugyldig status-verdi. Vennligst last siden på nytt.';
        } else {
          userMessage = 'Ugyldig dataformat';
        }
        break;
      default:
        userMessage = error.message || userMessage;
    }
    details = error.details || '';
  } else {
    // Regular Error
    userMessage = error.message || userMessage;
  }

  const errorDetails: SupabaseErrorDetails = {
    code: 'code' in error ? error.code : undefined,
    message: userMessage,
    details,
    hint: 'hint' in error ? error.hint : undefined
  };

  // Show toast notification
  toast({
    title: "Feil",
    description: userMessage,
    variant: "destructive",
  });

  return errorDetails;
}

export function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 2,
  delay: number = 1000
): Promise<T> {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const attempt = async () => {
      try {
        const result = await operation();
        resolve(result);
      } catch (error) {
        attempts++;
        if (attempts <= maxRetries) {
          console.log(`Retry attempt ${attempts} for operation`);
          setTimeout(attempt, delay * attempts);
        } else {
          reject(error);
        }
      }
    };

    attempt();
  });
}
