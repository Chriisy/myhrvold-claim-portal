import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Bug, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';

interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  title?: string;
  description?: string;
  onReset?: () => void;
  level?: 'warning' | 'error' | 'critical';
  showDetails?: boolean;
  enableReporting?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  showErrorDetails: boolean;
  errorId?: string;
}

export class EnhancedErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryCount = 0;
  private maxRetries = 3;

  public state: ErrorBoundaryState = {
    hasError: false,
    showErrorDetails: false
  };

  public static defaultProps = {
    title: 'Noe gikk galt',
    description: 'En feil oppstod ved lasting av denne komponenten.',
    level: 'error' as const,
    showDetails: process.env.NODE_ENV === 'development',
    enableReporting: true
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return { 
      hasError: true, 
      error,
      errorId
    };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('EnhancedErrorBoundary caught an error:', error, errorInfo);
    
    // Log error details
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errorId: this.state.errorId
    };

    // Store error in localStorage for debugging
    try {
      const existingErrors = JSON.parse(localStorage.getItem('error_logs') || '[]');
      existingErrors.push(errorDetails);
      // Keep only last 10 errors
      const recentErrors = existingErrors.slice(-10);
      localStorage.setItem('error_logs', JSON.stringify(recentErrors));
    } catch (e) {
      console.warn('Could not store error log:', e);
    }

    // Send error to monitoring service if enabled
    if (this.props.enableReporting) {
      this.reportError(errorDetails);
    }
    
    this.setState({
      error,
      errorInfo: {
        componentStack: errorInfo.componentStack
      }
    });

    // Show toast notification
    toast({
      title: "Komponentfeil oppdaget",
      description: `Feil ID: ${this.state.errorId}`,
      variant: "destructive",
    });
  }

  private reportError = async (errorDetails: any) => {
    try {
      // In a real app, send to error monitoring service
      console.log('Reporting error:', errorDetails);
      // Example: await errorReportingService.report(errorDetails);
    } catch (e) {
      console.warn('Error reporting failed:', e);
    }
  };

  private handleReset = () => {
    this.retryCount++;
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      showErrorDetails: false 
    });
    this.props.onReset?.();
  };

  private toggleErrorDetails = () => {
    this.setState(prev => ({ showErrorDetails: !prev.showErrorDetails }));
  };

  private getErrorSeverityIcon = () => {
    switch (this.props.level) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'critical':
        return <Shield className="w-5 h-5 text-red-600" />;
      default:
        return <Bug className="w-5 h-5 text-red-500" />;
    }
  };

  private getErrorSeverityColor = () => {
    switch (this.props.level) {
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'critical':
        return 'border-red-300 bg-red-100';
      default:
        return 'border-red-200 bg-red-50';
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const canRetry = this.retryCount < this.maxRetries;

      return (
        <Card className={`${this.getErrorSeverityColor()}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              {this.getErrorSeverityIcon()}
              {this.props.title}
            </CardTitle>
            <CardDescription className="text-red-600">
              {this.props.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {this.state.error && (
              <Alert variant="destructive">
                <AlertTitle>Feilmelding</AlertTitle>
                <AlertDescription>
                  {this.state.error.message}
                  {this.state.errorId && (
                    <div className="mt-2 text-xs text-gray-500">
                      Error ID: {this.state.errorId}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex flex-wrap gap-2">
              {canRetry && (
                <Button 
                  onClick={this.handleReset}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Prøv igjen ({this.maxRetries - this.retryCount} forsøk igjen)
                </Button>
              )}
              
              {!canRetry && (
                <Button 
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Last siden på nytt
                </Button>
              )}
              
              {this.props.showDetails && this.state.errorInfo && (
                <Button 
                  onClick={this.toggleErrorDetails} 
                  variant="outline"
                  size="sm"
                  className="text-gray-600"
                >
                  {this.state.showErrorDetails ? 'Skjul detaljer' : 'Vis detaljer'}
                </Button>
              )}
            </div>
            
            {this.props.showDetails && this.state.showErrorDetails && this.state.errorInfo && (
              <details open className="text-sm text-red-700 bg-red-100 p-3 rounded">
                <summary className="cursor-pointer font-medium">Tekniske detaljer</summary>
                <div className="mt-2 space-y-2">
                  <div>
                    <strong>Feilmelding:</strong>
                    <pre className="text-xs bg-white p-2 rounded mt-1 overflow-auto max-h-[100px]">
                      {this.state.error?.message}
                    </pre>
                  </div>
                  <div>
                    <strong>Stack trace:</strong>
                    <pre className="text-xs bg-white p-2 rounded mt-1 overflow-auto max-h-[200px]">
                      {this.state.error?.stack}
                    </pre>
                  </div>
                  <div>
                    <strong>Component stack:</strong>
                    <pre className="text-xs bg-white p-2 rounded mt-1 overflow-auto max-h-[150px]">
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </div>
                </div>
              </details>
            )}

            {this.props.level === 'critical' && (
              <Alert>
                <Shield className="w-4 h-4" />
                <AlertTitle>Kritisk feil</AlertTitle>
                <AlertDescription>
                  Denne feilen krever øyeblikkelig oppmerksomhet. Kontakt systemadministrator.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
