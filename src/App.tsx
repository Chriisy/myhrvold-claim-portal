
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AuthProvider } from "./contexts/AuthContext";
import { DashboardFiltersProvider } from "./contexts/DashboardFiltersContext";
import { CookieConsentProvider } from "./contexts/CookieConsentContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { OptimizedErrorBoundary } from "./components/shared/OptimizedErrorBoundary";
import React, { Suspense } from "react";
import { OptimizedLoadingStates } from "./components/shared/OptimizedLoadingStates";
import "./App.css";

// Lazy load modules for better performance
const Index = React.lazy(() => import("./pages/Index"));
const Login = React.lazy(() => import("./pages/Login"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const ClaimsList = React.lazy(() => import("./pages/ClaimsList"));
const ClaimDetail = React.lazy(() => import("./pages/ClaimDetail"));
const ClaimWizard = React.lazy(() => import("./pages/ClaimWizard"));
const Suppliers = React.lazy(() => import("./pages/Suppliers"));
const Reports = React.lazy(() => import("./pages/Reports"));
const UserManagement = React.lazy(() => import("./pages/UserManagement"));
const UserProfile = React.lazy(() => import("./pages/UserProfile"));
const FGasCertificates = React.lazy(() => import("./pages/FGasCertificates"));
const InvoiceImport = React.lazy(() => import("./pages/InvoiceImport"));
const Installations = React.lazy(() => import("./pages/Installations"));
const InstallationDetail = React.lazy(() => import("./pages/InstallationDetail"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const PrivacyPolicy = React.lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = React.lazy(() => import("./pages/TermsOfService"));
const CookiePolicy = React.lazy(() => import("./pages/CookiePolicy"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - longer cache for better performance
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) {
            return false;
          }
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
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
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <SidebarProvider>
                    <div className="min-h-screen flex w-full">
                      <Routes>
                        {/* Public routes */}
                        <Route path="/" element={
                          <Suspense fallback={<OptimizedLoadingStates.Dashboard />}>
                            <Index />
                          </Suspense>
                        } />
                        <Route path="/login" element={
                          <Suspense fallback={<OptimizedLoadingStates.Form />}>
                            <Login />
                          </Suspense>
                        } />
                        <Route path="/privacy" element={
                          <Suspense fallback={<OptimizedLoadingStates.Dashboard />}>
                            <PrivacyPolicy />
                          </Suspense>
                        } />
                        <Route path="/terms" element={
                          <Suspense fallback={<OptimizedLoadingStates.Dashboard />}>
                            <TermsOfService />
                          </Suspense>
                        } />
                        <Route path="/cookies" element={
                          <Suspense fallback={<OptimizedLoadingStates.Dashboard />}>
                            <CookiePolicy />
                          </Suspense>
                        } />
                        
                        {/* Protected routes with sidebar */}
                        <Route path="/*" element={
                          <ProtectedRoute>
                            <div className="flex w-full">
                              <AppSidebar />
                              <main className="flex-1 overflow-auto">
                                <OptimizedErrorBoundary>
                                  <Suspense fallback={<OptimizedLoadingStates.Dashboard />}>
                                    <Routes>
                                      <Route path="/dashboard" element={<Dashboard />} />
                                      <Route path="/claims" element={<ClaimsList />} />
                                      <Route path="/claims/:id" element={<ClaimDetail />} />
                                      <Route path="/claims/new" element={<ClaimWizard />} />
                                      <Route path="/suppliers" element={<Suppliers />} />
                                      <Route path="/reports" element={<Reports />} />
                                      <Route path="/users" element={<UserManagement />} />
                                      <Route path="/profile" element={<UserProfile />} />
                                      <Route path="/certificates" element={<FGasCertificates />} />
                                      <Route path="/import" element={<InvoiceImport />} />
                                      <Route path="/installations" element={<Installations />} />
                                      <Route path="/installations/:id" element={<InstallationDetail />} />
                                      <Route path="*" element={<NotFound />} />
                                    </Routes>
                                  </Suspense>
                                </OptimizedErrorBoundary>
                              </main>
                            </div>
                          </ProtectedRoute>
                        } />
                      </Routes>
                    </div>
                  </SidebarProvider>
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
