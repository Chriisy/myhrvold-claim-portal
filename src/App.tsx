import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import { DashboardFiltersProvider } from "@/contexts/DashboardFiltersContext";
import { CookieConsentProvider } from "@/contexts/CookieConsentContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ImprovedErrorBoundary } from "@/components/shared/ImprovedErrorBoundary";
import { CookieBanner } from "@/components/privacy/CookieBanner";
import Dashboard from "./pages/Dashboard";
import ClaimsList from "./pages/ClaimsList";
import ClaimDetail from "./pages/ClaimDetail";
import ClaimWizard from "./pages/ClaimWizard";
import Suppliers from "./pages/Suppliers";
import Reports from "./pages/Reports";
import InvoiceImport from "./pages/InvoiceImport";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CookiePolicy from "./pages/CookiePolicy";
import TermsOfService from "./pages/TermsOfService";
import UserProfile from "./pages/UserProfile";
import UserManagement from "./pages/UserManagement";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on auth errors
        if ('code' in error && error.code === '42501') {
          return false;
        }
        return failureCount < 2;
      }
    }
  }
});

const App = () => (
  <ImprovedErrorBoundary
    title="Applikasjonfeil"
    description="Det oppstod en alvorlig feil i applikasjonen. Vennligst last siden på nytt."
  >
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <CookieConsentProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/cookie-policy" element={<CookiePolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <DashboardFiltersProvider>
                        <SidebarProvider>
                          <div className="min-h-screen flex w-full">
                            <AppSidebar />
                            <main className="flex-1 p-6 bg-myhrvold-bg">
                              <Routes>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/claims" element={<ClaimsList />} />
                                <Route path="/claim/new" element={<ClaimWizard />} />
                                <Route path="/claim/:id" element={<ClaimDetail />} />
                                <Route path="/suppliers" element={<Suppliers />} />
                                <Route path="/import" element={<InvoiceImport />} />
                                <Route path="/reports" element={<Reports />} />
                                <Route path="/profile" element={<UserProfile />} />
                                <Route path="/admin/users" element={<UserManagement />} />
                                <Route path="/404" element={<NotFound />} />
                                <Route path="*" element={<Navigate to="/404" replace />} />
                              </Routes>
                            </main>
                          </div>
                        </SidebarProvider>
                      </DashboardFiltersProvider>
                    </ProtectedRoute>
                  }
                />
              </Routes>
              <CookieBanner />
            </BrowserRouter>
          </AuthProvider>
        </CookieConsentProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ImprovedErrorBoundary>
);

export default App;
