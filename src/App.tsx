
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
import './App.css';

// Lazy load all pages for better performance
const Index = lazy(() => import('./pages/Index'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const ClaimsList = lazy(() => import('./pages/ClaimsList'));
const ClaimDetail = lazy(() => import('./pages/ClaimDetail'));
const ClaimWizard = lazy(() => import('./pages/ClaimWizard'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const Suppliers = lazy(() => import('./pages/Suppliers'));
const Reports = lazy(() => import('./pages/Reports'));
const InvoiceImport = lazy(() => import('./pages/InvoiceImport'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const NotFound = lazy(() => import('./pages/NotFound'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        if (error && typeof error === 'object' && 'status' in error) {
          return (error as any).status >= 500 && failureCount < 2;
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
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
                          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6 lg:py-8 mx-auto max-w-screen-2xl">
                            <Suspense fallback={<DashboardSkeleton />}>
                              <Routes>
                                <Route path="/login" element={<Login />} />
                                <Route path="/privacy" element={<PrivacyPolicy />} />
                                <Route path="/cookies" element={<CookiePolicy />} />
                                <Route path="/terms" element={<TermsOfService />} />
                                
                                <Route path="/" element={
                                  <ProtectedRoute>
                                    <Dashboard />
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
                                
                                <Route path="/claim/:id" element={
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
