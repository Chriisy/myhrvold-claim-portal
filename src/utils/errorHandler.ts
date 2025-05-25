interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  timestamp: Date;
}

interface ErrorLog {
  id: string;
  error: Error;
  context: ErrorContext;
  handled: boolean;
}

class ErrorHandler {
  private errors: ErrorLog[] = [];
  private maxErrors = 100;

  logError(error: Error, context: Partial<ErrorContext> = {}) {
    const errorLog: ErrorLog = {
      id: crypto.randomUUID(),
      error,
      context: {
        timestamp: new Date(),
        ...context
      },
      handled: false
    };

    this.errors.unshift(errorLog);
    
    // Keep only the latest errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorLog);
    }

    // Mark as handled
    errorLog.handled = true;

    return errorLog.id;
  }

  getRecentErrors(limit: number = 10): ErrorLog[] {
    return this.errors.slice(0, limit);
  }

  getErrorCount(): number {
    return this.errors.length;
  }

  clearErrors(): void {
    this.errors = [];
  }

  getErrorRate(timeWindow: number = 60000): number {
    const now = new Date();
    const windowStart = new Date(now.getTime() - timeWindow);
    
    const recentErrors = this.errors.filter(
      error => error.context.timestamp >= windowStart
    );
    
    return recentErrors.length;
  }
}

export const errorHandler = new ErrorHandler();

// Global error handler
window.addEventListener('error', (event) => {
  errorHandler.logError(event.error, {
    component: 'Global',
    action: 'Runtime Error'
  });
});

window.addEventListener('unhandledrejection', (event) => {
  errorHandler.logError(new Error(event.reason), {
    component: 'Global',
    action: 'Unhandled Promise Rejection'
  });
});
