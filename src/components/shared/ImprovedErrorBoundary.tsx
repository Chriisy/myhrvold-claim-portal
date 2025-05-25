
import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  title?: string;
  description?: string;
  onReset?: () => void;
  errorReporter?: (error: Error, componentStack: string) => void;
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  showErrorDetails: boolean;
}

export class ImprovedErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    showErrorDetails: false
  };

  public static defaultProps = {
    title: 'Noe gikk galt',
    description: 'En feil oppstod ved lasting av denne komponenten.',
    showDetails: process.env.NODE_ENV === 'development'
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Send error to reporting service if provided
    if (this.props.errorReporter) {
      this.props.errorReporter(error, errorInfo.componentStack);
    }
    
    this.setState({
      error,
      errorInfo
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    this.props.onReset?.();
  };

  private toggleErrorDetails = () => {
    this.setState(prev => ({ showErrorDetails: !prev.showErrorDetails }));
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
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
                <AlertDescription>{this.state.error.message}</AlertDescription>
              </Alert>
            )}
            
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={this.handleReset}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Prøv igjen
              </Button>
              
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
                <pre className="mt-2 whitespace-pre-wrap text-xs overflow-auto max-h-[300px] p-2">
                  {this.state.error?.stack}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
