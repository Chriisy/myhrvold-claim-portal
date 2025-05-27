
export interface ErrorDetails {
  code?: string;
  message: string;
  details?: string;
  hint?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface RetryConfig {
  maxRetries?: number;
  delay?: number;
  exponentialBackoff?: boolean;
  onRetry?: (attempt: number, error: any) => void;
}

export interface ErrorContext {
  component?: string;
  action?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface SecureContext {
  component: string;
  action: string;
  timestamp: string;
  sessionId: string;
  userAgent: string;
  url: string;
}

export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
}
