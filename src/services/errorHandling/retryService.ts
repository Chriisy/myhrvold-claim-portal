
import { RetryConfig } from './errorTypes';
import { globalErrorHandler } from './globalErrorHandler';

export class RetryService {
  static async withRetry<T>(
    operation: () => Promise<T>,
    config: RetryConfig = {}
  ): Promise<T> {
    const { 
      maxRetries = 2, 
      delay = 1000, 
      exponentialBackoff = true,
      onRetry 
    } = config;
    
    let attempts = 0;
    let lastError: any;

    const attempt = async (): Promise<T> => {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        attempts++;
        
        if (attempts <= maxRetries) {
          console.log(`Retry attempt ${attempts}/${maxRetries} for operation`);
          
          onRetry?.(attempts, error);
          
          const waitTime = exponentialBackoff 
            ? delay * Math.pow(2, attempts - 1) 
            : delay * attempts;
          
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return attempt();
        }
        throw error;
      }
    };

    try {
      return await attempt();
    } catch (error) {
      // Log final failure
      globalErrorHandler.logError(lastError, {
        action: 'Retry operation failed',
        severity: 'high'
      });
      throw error;
    }
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
