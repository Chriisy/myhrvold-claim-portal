
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredPermission }) => {
  const { user, session, isLoading, hasPermission } = useAuth();

  if (process.env.NODE_ENV === 'development') {
    console.log('ProtectedRoute: user:', !!user, 'session:', !!session, 'isLoading:', isLoading);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-myhrvold-bg">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-myhrvold-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-myhrvold-primary">Laster...</p>
          <p className="text-sm text-gray-600 mt-2">
            Hvis denne skjermen vises for lenge, prøv å oppdatere siden.
          </p>
        </div>
      </div>
    );
  }

  // Require both user and session for full authentication
  if (!user || !session) {
    if (process.env.NODE_ENV === 'development') {
      console.log('ProtectedRoute: Redirecting to login - user or session missing');
    }
    return <Navigate to="/login" replace />;
  }

  // Check for required permission if specified
  if (requiredPermission && !hasPermission(requiredPermission)) {
    if (process.env.NODE_ENV === 'development') {
      console.log('ProtectedRoute: Access denied - missing permission:', requiredPermission);
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
