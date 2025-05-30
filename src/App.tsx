
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from './contexts/AuthContext';
import { CookieConsentProvider } from './contexts/CookieConsentContext';
import { DashboardFiltersProvider } from './contexts/DashboardFiltersContext';
import DashboardLayout from './components/layout/DashboardLayout';
import { ClaimList } from './components/claims/ClaimList';
import { SupplierList } from './components/suppliers/SupplierList';
import { UserList } from './components/users/UserList';
import { ReportDashboard } from './components/reports/ReportDashboard';
import { RequireAuth } from './components/auth/RequireAuth';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { ForgotPassword } from './components/auth/ForgotPassword';
import { ResetPassword } from './components/auth/ResetPassword';
import { Impersonate } from './components/admin/Impersonate';
import { AddClaimModal } from './components/claims/AddClaimModal';
import { EditClaimModal } from './components/claims/EditClaimModal';
import { ClaimDetails } from './components/claims/ClaimDetails';
import { SupplierDetails } from './components/suppliers/SupplierDetails';
import { AddSupplierModal } from './components/suppliers/AddSupplierModal';
import { UserDetails } from './components/users/UserDetails';
import { AddUserModal } from './components/users/AddUserModal';
import { EditUserModal } from './components/users/EditUserModal';
import FGasCertificates from './pages/FGasCertificates';
import { AddCertificateModal } from './components/certificates/AddCertificateModal';
import { EditCertificateModal } from './components/certificates/EditCertificateModal';
import { InternalControlDashboard } from './components/certificates/internal-control/InternalControlDashboard';
import { PWAInstallButton } from '@/components/shared/PWAInstallButton';
import { TouchOptimizedNav } from '@/components/shared/TouchOptimizedNav';
import { PushNotificationSettings } from '@/components/shared/PushNotificationSettings';
import { OfflineFormHandler } from '@/components/shared/OfflineFormHandler';
import { pwaManager } from '@/utils/pwa';
import { useEffect } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  useEffect(() => {
    // Initialize PWA on app start
    try {
      pwaManager.registerServiceWorker();
      
      // Request notification permission on user interaction
      const requestNotifications = async () => {
        try {
          const permission = await pwaManager.requestNotificationPermission();
          console.log('Notification permission:', permission);
        } catch (error) {
          console.error('Notification permission error:', error);
        }
      };
      
      // Add click listener for notification permission
      document.addEventListener('click', requestNotifications, { once: true });
      
      return () => {
        document.removeEventListener('click', requestNotifications);
      };
    } catch (error) {
      console.error('PWA initialization error:', error);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CookieConsentProvider>
          <DashboardFiltersProvider>
            <Router>
              <div className="min-h-screen bg-background">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />
                  
                  <Route path="/impersonate/:userId" element={<Impersonate />} />

                  <Route path="/" element={<RequireAuth><DashboardLayout><ClaimList /></DashboardLayout></RequireAuth>} />
                  <Route path="/claims" element={<RequireAuth><DashboardLayout><ClaimList /></DashboardLayout></RequireAuth>} />
                  <Route path="/claims/:id" element={<RequireAuth><DashboardLayout><ClaimDetails /></DashboardLayout></RequireAuth>} />
                  <Route path="/suppliers" element={<RequireAuth><DashboardLayout><SupplierList /></DashboardLayout></RequireAuth>} />
                  <Route path="/suppliers/:id" element={<RequireAuth><DashboardLayout><SupplierDetails /></DashboardLayout></RequireAuth>} />
                  <Route path="/users" element={<RequireAuth><DashboardLayout><UserList /></DashboardLayout></RequireAuth>} />
                  <Route path="/users/:id" element={<RequireAuth><DashboardLayout><UserDetails /></DashboardLayout></RequireAuth>} />
                  <Route path="/reports" element={<RequireAuth><DashboardLayout><ReportDashboard /></DashboardLayout></RequireAuth>} />
                  <Route path="/f-gas-certificates" element={<RequireAuth><DashboardLayout><FGasCertificates /></DashboardLayout></RequireAuth>} />
                  <Route path="/internal-control" element={<RequireAuth><DashboardLayout><InternalControlDashboard /></DashboardLayout></RequireAuth>} />
                  <Route path="/pwa-settings" element={<RequireAuth><DashboardLayout><div className="p-6 space-y-6"><PushNotificationSettings /><OfflineFormHandler /></div></DashboardLayout></RequireAuth>} />

                  {/* Modals as routes */}
                  <Route path="/claims/add" element={<AddClaimModal open={true} onClose={() => { window.history.back(); }} />} />
                  <Route path="/claims/edit/:id" element={<EditClaimModal open={true} onClose={() => { window.history.back(); }} />} />
                  <Route path="/suppliers/add" element={<AddSupplierModal open={true} onClose={() => { window.history.back(); }} />} />
                  <Route path="/users/add" element={<AddUserModal open={true} onClose={() => { window.history.back(); }} />} />
                  <Route path="/users/edit/:id" element={<EditUserModal open={true} onClose={() => { window.history.back(); }} />} />
                  <Route path="/f-gas-certificates/add" element={<AddCertificateModal open={true} onClose={() => { window.history.back(); }} />} />
                  <Route path="/f-gas-certificates/edit/:id" element={<EditCertificateModal open={true} onClose={() => { window.history.back(); }} certificate={null} />} />
                </Routes>
                <Toaster />
                <PWAInstallButton />
                <TouchOptimizedNav />
              </div>
            </Router>
          </DashboardFiltersProvider>
        </CookieConsentProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
