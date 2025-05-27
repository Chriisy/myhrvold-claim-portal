
import { PostgrestError } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ErrorLog {
  id: string;
  error: Error | PostgrestError;
  context: ErrorContext;
  handled: boolean;
  retryCount: number;
}

class GlobalErrorHandler {
  private errors: ErrorLog[] = [];
  private maxErrors = 100;
  private retryDelays = [1000, 2000, 4000]; // Exponential backoff

  logError(error: Error | PostgrestError, context: Partial<ErrorContext> = {}) {
    const errorLog: ErrorLog = {
      id: crypto.randomUUID(),
      error,
      context: {
        timestamp: new Date(),
        severity: 'medium',
        ...context
      },
      handled: false,
      retryCount: 0
    };

    this.errors.unshift(errorLog);
    
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // Enhanced logging
    if (process.env.NODE_ENV === 'development') {
      console.group(`🔴 Error logged [${errorLog.context.severity}]`);
      console.error('Error:', error);
      console.log('Context:', errorLog.context);
      console.log('Error ID:', errorLog.id);
      console.groupEnd();
    }

    // Handle different severity levels
    this.handleErrorBySeverity(errorLog);

    errorLog.handled = true;
    return errorLog.id;
  }

  private handleErrorBySeverity(errorLog: ErrorLog) {
    const { severity } = errorLog.context;
    
    switch (severity) {
      case 'critical':
        this.handleCriticalError(errorLog);
        break;
      case 'high':
        this.handleHighSeverityError(errorLog);
        break;
      case 'medium':
        this.handleMediumSeverityError(errorLog);
        break;
      case 'low':
        this.handleLowSeverityError(errorLog);
        break;
    }
  }

  private handleCriticalError(errorLog: ErrorLog) {
    toast({
      title: "Kritisk systemfeil",
      description: "En alvorlig feil har oppstått. Kontakt systemadministrator umiddelbart.",
      variant: "destructive",
    });
    
    // Send to monitoring service
    this.reportToMonitoring(errorLog);
  }

  private handleHighSeverityError(errorLog: ErrorLog) {
    toast({
      title: "Alvorlig feil",
      description: "En feil oppstod som kan påvirke systemfunksjonalitet.",
      variant: "destructive",
    });
  }

  private handleMediumSeverityError(errorLog: ErrorLog) {
    const message = this.getUserFriendlyMessage(errorLog.error);
    toast({
      title: "Feil",
      description: message,
      variant: "destructive",
    });
  }

  private handleLowSeverityError(errorLog: ErrorLog) {
    // Log only, no user notification for low severity
    console.warn('Low severity error:', errorLog.error.message);
  }

  private getUserFriendlyMessage(error: Error | PostgrestError): string {
    if ('code' in error) {
      // PostgrestError
      switch (error.code) {
        case 'PGRST116':
          return 'Ingen data funnet for forespørselen.';
        case '42501':
          return 'Du har ikke tilgang til denne operasjonen.';
        case '23505':
          return 'Denne oppføringen eksisterer allerede.';
        case '23503':
          return 'Kan ikke slette - det finnes relaterte data.';
        case 'PGRST301':
          return 'Tilkoblingsproblem med database. Prøv igjen.';
        case '42P17':
          return 'Konfigurasjonsfeil i systemet. Kontakt administrator.';
        case '22P02':
          return 'Ugyldig dataformat. Vennligst sjekk inndataene.';
        default:
          return error.message || 'En uventet databasefeil oppstod.';
      }
    }
    
    // Regular Error
    if (error.message.includes('fetch')) {
      return 'Nettverksfeil. Sjekk internettforbindelsen og prøv igjen.';
    }
    
    if (error.message.includes('timeout')) {
      return 'Forespørselen tok for lang tid. Prøv igjen.';
    }
    
    return error.message || 'En uventet feil oppstod.';
  }

  private async reportToMonitoring(errorLog: ErrorLog) {
    try {
      // In production, send to monitoring service like Sentry
      console.log('Reporting to monitoring service:', errorLog);
      
      // Store locally as fallback
      const monitoringData = {
        errorId: errorLog.id,
        message: errorLog.error.message,
        timestamp: errorLog.context.timestamp,
        severity: errorLog.context.severity,
        component: errorLog.context.component,
        action: errorLog.context.action,
        userAgent: navigator.userAgent,
        url: window.location.href
      };
      
      localStorage.setItem(`error_${errorLog.id}`, JSON.stringify(monitoringData));
    } catch (e) {
      console.error('Failed to report error to monitoring:', e);
    }
  }

  async retryOperation<T>(
    operation: () => Promise<T>,
    errorId: string,
    maxRetries: number = 3
  ): Promise<T> {
    const errorLog = this.errors.find(e => e.id === errorId);
    if (!errorLog) {
      throw new Error('Error log not found');
    }

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = this.retryDelays[Math.min(attempt - 1, this.retryDelays.length - 1)];
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        const result = await operation();
        
        if (attempt > 0) {
          toast({
            title: "Operasjon vellykket",
            description: `Operasjonen lyktes etter ${attempt} forsøk.`,
          });
        }
        
        return result;
      } catch (error) {
        errorLog.retryCount = attempt + 1;
        
        if (attempt === maxRetries) {
          this.logError(error as Error, {
            ...errorLog.context,
            action: `${errorLog.context.action} (retry failed)`,
            severity: 'high'
          });
          throw error;
        }
      }
    }
    
    throw new Error('Retry operation failed');
  }

  getRecentErrors(limit: number = 10): ErrorLog[] {
    return this.errors.slice(0, limit);
  }

  getErrorsByComponent(component: string): ErrorLog[] {
    return this.errors.filter(error => error.context.component === component);
  }

  getErrorRate(timeWindow: number = 60000): number {
    const now = new Date();
    const windowStart = new Date(now.getTime() - timeWindow);
    
    const recentErrors = this.errors.filter(
      error => error.context.timestamp >= windowStart
    );
    
    return recentErrors.length;
  }

  clearErrors(): void {
    this.errors = [];
  }

  exportErrorLogs(): string {
    return JSON.stringify(this.errors, null, 2);
  }
}

export const globalErrorHandler = new GlobalErrorHandler();

// Enhanced global error handlers
window.addEventListener('error', (event) => {
  globalErrorHandler.logError(event.error, {
    component: 'Global',
    action: 'Runtime Error',
    severity: 'high'
  });
});

window.addEventListener('unhandledrejection', (event) => {
  globalErrorHandler.logError(new Error(event.reason), {
    component: 'Global',
    action: 'Unhandled Promise Rejection',
    severity: 'high'
  });
});

// Network error detection
window.addEventListener('online', () => {
  toast({
    title: "Tilkobling gjenopprettet",
    description: "Internettforbindelsen er tilbake.",
  });
});

window.addEventListener('offline', () => {
  toast({
    title: "Mistet tilkobling",
    description: "Sjekk internettforbindelsen din.",
    variant: "destructive",
  });
});
