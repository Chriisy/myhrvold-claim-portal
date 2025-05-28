
import { ReactNode } from 'react';
import { UnifiedErrorBoundary } from '@/components/shared/UnifiedErrorBoundary';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  title?: string;
  onReset?: () => void;
}

export const ErrorBoundaryWrapper = (props: Props) => {
  return <UnifiedErrorBoundary {...props} onError={() => {}} />;
};
