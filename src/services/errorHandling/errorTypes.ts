
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
  severity?: 'low' | 'medium' | 'high' | 'critical';
  action?: string;
  timestamp?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
}
