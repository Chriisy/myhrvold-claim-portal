
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from './contexts/AuthContext';
import { CookieConsentProvider } from './contexts/CookieConsentContext';
import { DashboardFiltersProvider } from './contexts/DashboardFiltersContext';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import DashboardLayout from './components/layout/DashboardLayout';
import OptimizedDashboard from './components/dashboard/OptimizedDashboard';
import UserManagement from './pages/UserManagement';
import { ReportDashboard } from './components/reports/ReportDashboard';
import { RequireAuth } from './components/auth/RequireAuth';
import Login from './pages/Login';
import ClaimsList from './pages/ClaimsList';
import ClaimDetail from './pages/ClaimDetail';
import Suppliers from './pages/Suppliers';
import Installations from './pages/Installations';
import FGasCertificates from './pages/FGasCertificates';
import InvoiceImport from './pages/InvoiceImport';
import { Register } from './components/auth/Register';
import { ForgotPassword } from './components/auth/ForgotPassword';
import { ResetPassword } from './components/auth/ResetPassword';
import { Impersonate } from './components/admin/Impersonate';
import { AddClaimModal } from './components/claims/AddClaimModal';
import { EditClaimModal } from './components/claims/EditClaimModal';
import { SupplierDetails } from './components/suppliers/SupplierDetails';
import { AddSupplierModal } from './components/suppliers/AddSupplierModal';
import { UserDetails } from './components/users/UserDetails';
import { AddUserModal } from './components/users/AddUserModal';
import { EditUserModal } from './components/users/EditUserModal';
import { AddCertificateModal } from './components/certificates/AddCertificateModal';
import { EditCertificateModal } from './components/certificates/EditCertificateModal';
import { InternalControlDashboard } from './components/certificates/internal-control/InternalControlDashboard';

// Optimized QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error && typeof error === 'object' && 'status' in error) {
          return (error as any).status >= 500 && failureCount < 2;
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <CookieConsentProvider>
              <DashboardFiltersProvider>
                <div className="min-h-screen bg-background">
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />
                    
                    <Route path="/impersonate/:userId" element={<Impersonate />} />

                    <Route path="/" element={<RequireAuth><DashboardLayout><OptimizedDashboard /></DashboardLayout></RequireAuth>} />
                    <Route path="/dashboard" element={<RequireAuth><DashboardLayout><OptimizedDashboard /></DashboardLayout></RequireAuth>} />
                    <Route path="/claims" element={<RequireAuth><DashboardLayout><ClaimsList /></DashboardLayout></RequireAuth>} />
                    <Route path="/claims/:id" element={<RequireAuth><DashboardLayout><ClaimDetail /></DashboardLayout></RequireAuth>} />
                    <Route path="/installations" element={<RequireAuth><DashboardLayout><Installations /></DashboardLayout></RequireAuth>} />
                    <Route path="/suppliers" element={<RequireAuth><DashboardLayout><Suppliers /></DashboardLayout></RequireAuth>} />
                    <Route path="/suppliers/:id" element={<RequireAuth><DashboardLayout><SupplierDetails /></DashboardLayout></RequireAuth>} />
                    <Route path="/users" element={<RequireAuth><DashboardLayout><UserManagement /></DashboardLayout></RequireAuth>} />
                    <Route path="/users/:id" element={<RequireAuth><DashboardLayout><UserDetails /></DashboardLayout></RequireAuth>} />
                    <Route path="/reports" element={<RequireAuth><DashboardLayout><ReportDashboard /></DashboardLayout></RequireAuth>} />
                    <Route path="/certificates" element={<RequireAuth><DashboardLayout><FGasCertificates /></DashboardLayout></RequireAuth>} />
                    <Route path="/import" element={<RequireAuth><DashboardLayout><InvoiceImport /></DashboardLayout></RequireAuth>} />
                    <Route path="/internal-control" element={<RequireAuth><DashboardLayout><InternalControlDashboard /></DashboardLayout></RequireAuth>} />

                    {/* Modals as routes wrapped in ErrorBoundary */}
                    <Route path="/claims/add" element={
                      <ErrorBoundary>
                        <AddClaimModal open={true} onClose={() => { window.history.back(); }} />
                      </ErrorBoundary>
                    } />
                    <Route path="/claims/edit/:id" element={
                      <ErrorBoundary>
                        <EditClaimModal open={true} onClose={() => { window.history.back(); }} />
                      </ErrorBoundary>
                    } />
                    <Route path="/suppliers/add" element={
                      <ErrorBoundary>
                        <AddSupplierModal open={true} onClose={() => { window.history.back(); }} />
                      </ErrorBoundary>
                    } />
                    <Route path="/users/add" element={
                      <ErrorBoundary>
                        <AddUserModal open={true} onClose={() => { window.history.back(); }} />
                      </ErrorBoundary>
                    } />
                    <Route path="/users/edit/:id" element={
                      <ErrorBoundary>
                        <EditUserModal open={true} onClose={() => { window.history.back(); }} />
                      </ErrorBoundary>
                    } />
                    <Route path="/certificates/add" element={
                      <ErrorBoundary>
                        <AddCertificateModal open={true} onClose={() => { window.history.back(); }} />
                      </ErrorBoundary>
                    } />
                    <Route path="/certificates/edit/:id" element={
                      <ErrorBoundary>
                        <EditCertificateModal open={true} onClose={() => { window.history.back(); }} certificate={null} />
                      </ErrorBoundary>
                    } />
                  </Routes>
                  <Toaster />
                </div>
              </DashboardFiltersProvider>
            </CookieConsentProvider>
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
