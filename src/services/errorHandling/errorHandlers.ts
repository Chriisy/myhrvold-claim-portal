
import { PostgrestError } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';
import { globalErrorHandler } from './globalErrorHandler';
import { ErrorDetails, ErrorContext } from './errorTypes';

export class ErrorHandlers {
  static handleSupabaseError(
    error: PostgrestError | Error, 
    operation: string,
    context: ErrorContext = {}
  ): ErrorDetails {
    console.error(`Supabase error during ${operation}:`, error);
    
    let userMessage = `Kunne ikke ${operation}`;
    let severity: 'low' | 'medium' | 'high' | 'critical' = context.severity || 'medium';
    let details = '';
    let hint = '';
    
    if ('code' in error) {
      switch (error.code) {
        case 'PGRST116':
          userMessage = 'Ingen data funnet';
          severity = 'low';
          break;
        case '42501':
          userMessage = 'Du har ikke tilgang til denne operasjonen';
          severity = 'high';
          hint = 'Kontakt administrator for å få nødvendige tilganger';
          break;
        case '23505':
          userMessage = 'Denne oppføringen eksisterer allerede';
          severity = 'medium';
          hint = 'Prøv med andre verdier eller oppdater eksisterende data';
          break;
        case '23503':
          userMessage = 'Kan ikke slette - det finnes relaterte data';
          severity = 'medium';
          hint = 'Fjern relaterte data først, eller kontakt administrator';
          break;
        case 'PGRST301':
          userMessage = 'Database forbindelse feilet';
          severity = 'critical';
          hint = 'Sjekk internettforbindelsen eller kontakt administrator';
          break;
        case '22P02':
          if (error.message?.includes('enum')) {
            userMessage = 'Ugyldig verdi. Last siden på nytt og prøv igjen.';
            severity = 'medium';
          } else {
            userMessage = 'Ugyldig dataformat';
            severity = 'medium';
          }
          break;
        default:
          userMessage = error.message || userMessage;
          severity = 'medium';
      }
      details = error.details || '';
      if (error.hint && !hint) hint = error.hint;
    } else {
      if (error.message.includes('fetch')) {
        userMessage = 'Nettverksfeil';
        severity = 'high';
        hint = 'Sjekk internettforbindelsen og prøv igjen';
      } else if (error.message.includes('timeout')) {
        userMessage = 'Operasjonen tok for lang tid';
        severity = 'medium';
        hint = 'Prøv igjen, eller kontakt administrator hvis problemet vedvarer';
      } else {
        userMessage = error.message || userMessage;
      }
    }

    const errorDetails: ErrorDetails = {
      code: 'code' in error ? error.code : undefined,
      message: userMessage,
      details,
      hint,
      severity
    };

    // Log to global error handler
    globalErrorHandler.logError(error, {
      component: context.component || 'Unknown',
      action: operation,
      severity
    });

    // Show appropriate toast based on severity
    if (severity !== 'low') {
      toast({
        title: severity === 'critical' ? "Kritisk feil" : "Feil",
        description: userMessage,
        variant: "destructive",
      });
      
      if (hint && (severity === 'high' || severity === 'critical')) {
        setTimeout(() => {
          toast({
            title: "Tips",
            description: hint,
          });
        }, 1000);
      }
    }

    return errorDetails;
  }

  static shouldRetryQuery(failureCount: number, error: any): boolean {
    // Don't retry on auth errors
    if ('code' in error && ['42501', '42P17'].includes(error.code)) {
      return false;
    }
    
    // Don't retry on data validation errors
    if ('code' in error && ['23505', '22P02'].includes(error.code)) {
      return false;
    }
    
    // Retry on network/connection issues
    if ('code' in error && ['PGRST301', '53300', '08P01'].includes(error.code)) {
      return failureCount < 3;
    }
    
    return failureCount < 2;
  }
}

// Export with alternative names for backward compatibility
export const SupabaseErrorHandler = ErrorHandlers;
