
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
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ClaimsList from "./pages/ClaimsList";
import ClaimDetail from "./pages/ClaimDetail";
import ClaimWizard from "./pages/ClaimWizard";
import Suppliers from "./pages/Suppliers";
import Reports from "./pages/Reports";
import UserManagement from "./pages/UserManagement";
import UserProfile from "./pages/UserProfile";
import FGasCertificates from "./pages/FGasCertificates";
import InvoiceImport from "./pages/InvoiceImport";
import Installations from "./pages/Installations";
import InstallationDetail from "./pages/InstallationDetail";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
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
                        <Route path="/" element={<Index />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/privacy" element={<PrivacyPolicy />} />
                        <Route path="/terms" element={<TermsOfService />} />
                        <Route path="/cookies" element={<CookiePolicy />} />
                        
                        {/* Protected routes with sidebar */}
                        <Route path="/*" element={
                          <ProtectedRoute>
                            <div className="flex w-full">
                              <AppSidebar />
                              <main className="flex-1 overflow-auto">
                                <OptimizedErrorBoundary>
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
