
import { Suspense, lazy } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CookieConsentProvider } from './contexts/CookieConsentContext';
import { DashboardFiltersProvider } from './contexts/DashboardFiltersContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { OptimizedErrorBoundary } from '@/components/shared/OptimizedErrorBoundary';
import { DashboardSkeleton, TableSkeleton } from '@/components/shared/OptimizedLoadingStates';
import { ProtectedRoute } from './components/ProtectedRoute';
import { createOptimizedLazyComponent } from '@/components/shared/OptimizedLazyLoading';
import './App.css';

// Optimized lazy loading with preloading for critical routes
const Index = createOptimizedLazyComponent(() => import('./pages/Index'), { preload: true });
const Dashboard = createOptimizedLazyComponent(() => import('./pages/Dashboard'), { preload: true });
const Login = createOptimizedLazyComponent(() => import('./pages/Login'), { preload: true });
const ClaimsList = createOptimizedLazyComponent(() => import('./pages/ClaimsList'));
const ClaimDetail = createOptimizedLazyComponent(() => import('./pages/ClaimDetail'));
const ClaimWizard = createOptimizedLazyComponent(() => import('./pages/ClaimWizard'));
const UserManagement = createOptimizedLazyComponent(() => import('./pages/UserManagement'));
const Suppliers = createOptimizedLazyComponent(() => import('./pages/Suppliers'));
const Reports = createOptimizedLazyComponent(() => import('./pages/Reports'));
const InvoiceImport = createOptimizedLazyComponent(() => import('./pages/InvoiceImport'));
const UserProfile = createOptimizedLazyComponent(() => import('./pages/UserProfile'));
const NotFound = createOptimizedLazyComponent(() => import('./pages/NotFound'));
const PrivacyPolicy = createOptimizedLazyComponent(() => import('./pages/PrivacyPolicy'));
const CookiePolicy = createOptimizedLazyComponent(() => import('./pages/CookiePolicy'));
const TermsOfService = createOptimizedLazyComponent(() => import('./pages/TermsOfService'));

// Highly optimized query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      retry: (failureCount, error) => {
        if (error && typeof error === 'object' && 'status' in error) {
          if ((error as any).status >= 400 && (error as any).status < 500) {
            return false;
          }
          return (error as any).status >= 500 && failureCount < 2;
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 10000),
      refetchOnWindowFocus: false,
      refetchOnMount: 'always',
      refetchOnReconnect: 'always',
      // Enable query deduplication
      notifyOnChangeProps: ['data', 'error', 'isLoading'],
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

function App() {
  return (
    <OptimizedErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <CookieConsentProvider>
            <AuthProvider>
              <DashboardFiltersProvider>
                <BrowserRouter>
                  <SidebarProvider>
                    <div className="min-h-screen flex w-full bg-background">
                      <AppSidebar />
                      <main className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-auto">
                          <div className="container mx-auto p-4 max-w-7xl">
                            <Suspense fallback={<DashboardSkeleton />}>
                              <Routes>
                                <Route path="/login" element={<Login />} />
                                <Route path="/privacy" element={<PrivacyPolicy />} />
                                <Route path="/cookies" element={<CookiePolicy />} />
                                <Route path="/terms" element={<TermsOfService />} />
                                
                                <Route path="/" element={
                                  <ProtectedRoute>
                                    <Index />
                                  </ProtectedRoute>
                                } />
                                
                                <Route path="/dashboard" element={
                                  <ProtectedRoute>
                                    <Suspense fallback={<DashboardSkeleton />}>
                                      <Dashboard />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                
                                <Route path="/claims" element={
                                  <ProtectedRoute>
                                    <Suspense fallback={<TableSkeleton />}>
                                      <ClaimsList />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                
                                <Route path="/claims/:id" element={
                                  <ProtectedRoute>
                                    <ClaimDetail />
                                  </ProtectedRoute>
                                } />
                                
                                <Route path="/new-claim" element={
                                  <ProtectedRoute>
                                    <ClaimWizard />
                                  </ProtectedRoute>
                                } />
                                
                                <Route path="/claim/new" element={
                                  <ProtectedRoute>
                                    <ClaimWizard />
                                  </ProtectedRoute>
                                } />
                                
                                <Route path="/admin/users" element={
                                  <ProtectedRoute requiredPermission="manage_users">
                                    <Suspense fallback={<TableSkeleton />}>
                                      <UserManagement />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                
                                <Route path="/suppliers" element={
                                  <ProtectedRoute>
                                    <Suspense fallback={<TableSkeleton />}>
                                      <Suppliers />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                
                                <Route path="/reports" element={
                                  <ProtectedRoute requiredPermission="view_reports">
                                    <Reports />
                                  </ProtectedRoute>
                                } />
                                
                                <Route path="/import" element={
                                  <ProtectedRoute>
                                    <InvoiceImport />
                                  </ProtectedRoute>
                                } />
                                
                                <Route path="/profile" element={
                                  <ProtectedRoute>
                                    <UserProfile />
                                  </ProtectedRoute>
                                } />
                                
                                <Route path="*" element={<NotFound />} />
                              </Routes>
                            </Suspense>
                          </div>
                        </div>
                      </main>
                    </div>
                  </SidebarProvider>
                  <Toaster />
                  <Sonner />
                </BrowserRouter>
              </DashboardFiltersProvider>
            </AuthProvider>
          </CookieConsentProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </OptimizedErrorBoundary>
  );
}

export default App;
