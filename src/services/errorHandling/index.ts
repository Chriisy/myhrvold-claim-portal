
// Re-export everything from the refactored error handling modules
export { ErrorHandlers, SupabaseErrorHandler } from './errorHandlers';
export { RetryService } from './retryService';
export { ValidationService } from './validationService';
export * from './errorTypes';

// Legacy compatibility - maintain the original ErrorService interface
import { ErrorHandlers } from './errorHandlers';
import { RetryService } from './retryService';
import { ValidationService } from './validationService';

export class ErrorService {
  static handleSupabaseError = ErrorHandlers.handleSupabaseError;
  static withRetry = RetryService.withRetry;
  static shouldRetryQuery = RetryService.shouldRetryQuery;
  static validateInput = ValidationService.validateInput;
  static createSecureContext = ValidationService.createSecureContext;
}
