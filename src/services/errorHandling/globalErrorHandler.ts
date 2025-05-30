interface LogError {
  component?: string;
  action?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  timestamp?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
}

class GlobalErrorHandler {
  private errors: Array<{ error: any; context: LogError; timestamp: string }> = [];

  logError(error: any, context: LogError = {}) {
    const logEntry = {
      error: {
        message: error.message || 'Unknown error',
        code: error.code || undefined,
        stack: error.stack || undefined,
        name: error.name || 'Error'
      },
      context: {
        ...context,
        timestamp: new Date().toISOString(),
        sessionId: sessionStorage.getItem('session_id') || 'unknown',
        userAgent: navigator.userAgent.substring(0, 100),
        url: window.location.pathname
      },
      timestamp: new Date().toISOString()
    };

    this.errors.push(logEntry);
    
    // Keep only last 100 errors to prevent memory issues
    if (this.errors.length > 100) {
      this.errors = this.errors.slice(-100);
    }

    // Log to console for development
    console.error('Global Error Handler:', logEntry);
  }

  getErrors() {
    return [...this.errors];
  }

  clearErrors() {
    this.errors = [];
  }
}

export const globalErrorHandler = new GlobalErrorHandler();
