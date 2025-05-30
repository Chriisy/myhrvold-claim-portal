
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
}
