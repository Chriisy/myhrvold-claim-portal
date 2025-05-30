
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface RequireAuthProps {
  children: ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { user, session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-myhrvold-bg">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-myhrvold-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-myhrvold-primary">Laster...</p>
        </div>
      </div>
    );
  }

  // Require both user and session for full authentication
  if (!user || !session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
