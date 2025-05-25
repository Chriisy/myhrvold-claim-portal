
import { PostgrestError } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

export interface ErrorDetails {
  code?: string;
  message: string;
  details?: string;
  hint?: string;
}

export interface RetryConfig {
  maxRetries?: number;
  delay?: number;
  exponentialBackoff?: boolean;
}

export class ErrorService {
  static handleSupabaseError(error: PostgrestError | Error, operation: string): ErrorDetails {
    console.error(`Supabase error during ${operation}:`, error);
    
    let userMessage = `Kunne ikke ${operation}`;
    let details = '';
    
    if ('code' in error) {
      switch (error.code) {
        case 'PGRST116':
          userMessage = 'Ingen data funnet';
          break;
        case '42501':
          userMessage = 'Du har ikke tilgang til denne operasjonen';
          break;
        case '23505':
          userMessage =  'Denne oppføringen eksisterer allerede';
          break;
        case '23503':
          userMessage = 'Kan ikke slette - det finnes relaterte data';
          break;
        case 'PGRST301':
          userMessage = 'Database forbindelse feilet';
          break;
        default:
          userMessage = error.message || userMessage;
      }
      details = error.details || '';
    } else {
      userMessage = error.message || userMessage;
    }

    const errorDetails: ErrorDetails = {
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

  static async withRetry<T>(
    operation: () => Promise<T>,
    config: RetryConfig = {}
  ): Promise<T> {
    const { maxRetries = 2, delay = 1000, exponentialBackoff = true } = config;
    let attempts = 0;

    const attempt = async (): Promise<T> => {
      try {
        return await operation();
      } catch (error) {
        attempts++;
        if (attempts <= maxRetries) {
          console.log(`Retry attempt ${attempts} for operation`);
          const waitTime = exponentialBackoff ? delay * Math.pow(2, attempts - 1) : delay * attempts;
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return attempt();
        }
        throw error;
      }
    };

    return attempt();
  }

  static shouldRetryQuery(failureCount: number, error: any): boolean {
    // Don't retry on auth errors
    if ('code' in error && error.code === '42501') {
      return false;
    }
    return failureCount < 2;
  }
}
