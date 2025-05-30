
import { useState, useCallback } from 'react';

interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: boolean;
}

export const useRetry = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options: RetryOptions = {}
) => {
  const { maxAttempts = 3, delay = 1000, backoff = true } = options;
  const [attempts, setAttempts] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const execute = useCallback(async (...args: T): Promise<R> => {
    setIsRetrying(true);
    let currentAttempt = 0;
    
    while (currentAttempt < maxAttempts) {
      try {
        const result = await fn(...args);
        setAttempts(currentAttempt);
        setIsRetrying(false);
        return result;
      } catch (error) {
        currentAttempt++;
        setAttempts(currentAttempt);
        
        if (currentAttempt >= maxAttempts) {
          setIsRetrying(false);
          throw error;
        }
        
        const waitTime = backoff ? delay * Math.pow(2, currentAttempt - 1) : delay;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    setIsRetrying(false);
    throw new Error('Max retry attempts reached');
  }, [fn, maxAttempts, delay, backoff]);

  const reset = useCallback(() => {
    setAttempts(0);
    setIsRetrying(false);
  }, []);

  return { execute, attempts, isRetrying, reset };
};
