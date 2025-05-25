
import { ReactNode } from 'react';
import { ImprovedErrorBoundary } from '@/components/shared/ImprovedErrorBoundary';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  title?: string;
  onReset?: () => void;
}

export const ErrorBoundaryWrapper = (props: Props) => {
  return <ImprovedErrorBoundary {...props} />;
};
