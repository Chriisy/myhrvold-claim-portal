
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  title?: string;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class OptimizedErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('OptimizedErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              <span>{this.props.title || 'Noe gikk galt'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 mb-4">
              Det oppstod en uventet feil. Prøv å oppdatere siden eller ta kontakt med support hvis problemet vedvarer.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-4">
                <summary className="cursor-pointer text-sm font-medium">
                  Tekniske detaljer (kun synlig i utvikling)
                </summary>
                <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto max-h-40">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <Button onClick={this.handleReset} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Prøv igjen
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
