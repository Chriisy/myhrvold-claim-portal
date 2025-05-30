
import { PostgrestError } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';
import { ErrorDetails, ErrorContext } from './errorTypes';
import { globalErrorHandler } from './globalErrorHandler';

export class SupabaseErrorHandler {
  static handle(
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
      const result = this.handlePostgrestError(error, severity);
      userMessage = result.message;
      severity = result.severity;
      details = result.details;
      hint = result.hint;
    } else {
      const result = this.handleGenericError(error);
      userMessage = result.message;
      severity = result.severity;
      hint = result.hint;
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
    this.showToastNotification(userMessage, hint, severity);

    return errorDetails;
  }

  private static handlePostgrestError(error: PostgrestError, defaultSeverity: 'low' | 'medium' | 'high' | 'critical') {
    let message = error.message || 'Ukjent database feil';
    let severity = defaultSeverity;
    let details = error.details || '';
    let hint = error.hint || '';

    switch (error.code) {
      case 'PGRST116':
        message = 'Ingen data funnet';
        severity = 'low';
        break;
      case '42501':
        message = 'Du har ikke tilgang til denne operasjonen';
        severity = 'high';
        hint = 'Kontakt administrator for å få nødvendige tilganger';
        break;
      case '23505':
        message = 'Denne oppføringen eksisterer allerede';
        severity = 'medium';
        hint = 'Prøv med andre verdier eller oppdater eksisterende data';
        break;
      case '23503':
        message = 'Kan ikke slette - det finnes relaterte data';
        severity = 'medium';
        hint = 'Fjern relaterte data først, eller kontakt administrator';
        break;
      case 'PGRST301':
        message = 'Database forbindelse feilet';
        severity = 'critical';
        hint = 'Sjekk internettforbindelsen eller kontakt administrator';
        break;
      case '42P17':
        message = 'Database konfigurasjonsfeil';
        severity = 'critical';
        hint = 'Kontakt administrator umiddelbart';
        break;
      case '22P02':
        if (error.message?.includes('enum')) {
          message = 'Ugyldig verdi. Last siden på nytt og prøv igjen.';
          severity = 'medium';
        } else {
          message = 'Ugyldig dataformat';
          severity = 'medium';
        }
        break;
      case '08P01':
        message = 'Database protokollfeil';
        severity = 'high';
        hint = 'Dette kan være et midlertidig problem. Prøv igjen.';
        break;
      case '53300':
        message = 'Database er for opptatt';
        severity = 'high';
        hint = 'Vent litt og prøv igjen';
        break;
    }

    return { message, severity, details, hint };
  }

  private static handleGenericError(error: Error) {
    let message = error.message || 'Ukjent feil';
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    let hint = '';

    if (error.message.includes('fetch')) {
      message = 'Nettverksfeil';
      severity = 'high';
      hint = 'Sjekk internettforbindelsen og prøv igjen';
    } else if (error.message.includes('timeout')) {
      message = 'Operasjonen tok for lang tid';
      severity = 'medium';
      hint = 'Prøv igjen, eller kontakt administrator hvis problemet vedvarer';
    }

    return { message, severity, hint };
  }

  private static showToastNotification(message: string, hint: string, severity: 'low' | 'medium' | 'high' | 'critical') {
    if (severity !== 'low') {
      toast({
        title: severity === 'critical' ? "Kritisk feil" : "Feil",
        description: message,
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
  }
}
