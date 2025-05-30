
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { FullPageLoader } from "@/components/shared/LoadingSpinner";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Lazy load pages for better performance
import { lazy, Suspense } from "react";

const Login = lazy(() => import("@/pages/Login"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const ClaimsList = lazy(() => import("@/pages/ClaimsList"));
const ClaimDetail = lazy(() => import("@/pages/ClaimDetail"));
const ClaimWizard = lazy(() => import("@/pages/ClaimWizard"));
const Suppliers = lazy(() => import("@/pages/Suppliers"));
const UserManagement = lazy(() => import("@/pages/UserManagement"));
const Reports = lazy(() => import("@/pages/Reports"));
const Installations = lazy(() => import("@/pages/Installations"));
const InstallationDetail = lazy(() => import("@/pages/InstallationDetail"));
const FGasCertificates = lazy(() => import("@/pages/FGasCertificates"));
const InvoiceImport = lazy(() => import("@/pages/InvoiceImport"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        if (error && typeof error === 'object' && 'status' in error) {
          const status = error.status as number;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 3;
      },
    },
  },
});

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <BrowserRouter>
              <div className="min-h-screen bg-background">
                {!isOnline && (
                  <div className="bg-destructive text-destructive-foreground text-center py-2 text-sm">
                    Du er offline. Noen funksjoner kan være begrenset.
                  </div>
                )}
                <ErrorBoundary>
                  <Suspense fallback={<FullPageLoader text="Laster side..." />}>
                    <Routes>
                      <Route path="/login" element={<Login />} />
                      <Route path="/" element={
                        <ProtectedRoute>
                          <Navigate to="/dashboard" replace />
                        </ProtectedRoute>
                      } />
                      <Route path="/dashboard" element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="/claims" element={
                        <ProtectedRoute>
                          <ClaimsList />
                        </ProtectedRoute>
                      } />
                      <Route path="/claims/new" element={
                        <ProtectedRoute>
                          <ClaimWizard />
                        </ProtectedRoute>
                      } />
                      <Route path="/claims/:id" element={
                        <ProtectedRoute>
                          <ClaimDetail />
                        </ProtectedRoute>
                      } />
                      <Route path="/suppliers" element={
                        <ProtectedRoute>
                          <Suppliers />
                        </ProtectedRoute>
                      } />
                      <Route path="/users" element={
                        <ProtectedRoute>
                          <UserManagement />
                        </ProtectedRoute>
                      } />
                      <Route path="/reports" element={
                        <ProtectedRoute>
                          <Reports />
                        </ProtectedRoute>
                      } />
                      <Route path="/installations" element={
                        <ProtectedRoute>
                          <Installations />
                        </ProtectedRoute>
                      } />
                      <Route path="/installations/:id" element={
                        <ProtectedRoute>
                          <InstallationDetail />
                        </ProtectedRoute>
                      } />
                      <Route path="/certificates" element={
                        <ProtectedRoute>
                          <FGasCertificates />
                        </ProtectedRoute>
                      } />
                      <Route path="/import" element={
                        <ProtectedRoute>
                          <InvoiceImport />
                        </ProtectedRoute>
                      } />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </ErrorBoundary>
              </div>
              <Toaster />
              <Sonner />
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
