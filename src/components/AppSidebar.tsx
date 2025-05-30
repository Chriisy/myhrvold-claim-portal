
import { Home, FileText, Users, BarChart3, UserCheck, Shield, Upload, Wrench } from "lucide-react"
import React, { useTransition } from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"

// Preload imports for performance
const preloadModules = {
  dashboard: () => import("@/components/dashboard/OptimizedDashboard"),
  claims: () => import("@/pages/ClaimsList"),
  installations: () => import("@/pages/Installations"),
  suppliers: () => import("@/pages/Suppliers"),
  reports: () => import("@/components/reports/ReportDashboard"),
  users: () => import("@/pages/UserManagement"),
  certificates: () => import("@/pages/FGasCertificates"),
  import: () => import("@/pages/InvoiceImport"),
};

// Menu items with preload functions
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    preload: preloadModules.dashboard,
  },
  {
    title: "Reklamasjoner",
    url: "/claims",
    icon: FileText,
    preload: preloadModules.claims,
  },
  {
    title: "Installasjoner",
    url: "/installations",
    icon: Wrench,
    preload: preloadModules.installations,
  },
  {
    title: "Leverandører",
    url: "/suppliers",
    icon: Users,
    preload: preloadModules.suppliers,
  },
  {
    title: "Rapporter",
    url: "/reports",
    icon: BarChart3,
    preload: preloadModules.reports,
  },
  {
    title: "Brukere",
    url: "/users",
    icon: UserCheck,
    adminOnly: true,
    preload: preloadModules.users,
  },
  {
    title: "F-gass Sertifikater",
    url: "/certificates",
    icon: Shield,
    preload: preloadModules.certificates,
  },
  {
    title: "Import",
    url: "/import",
    icon: Upload,
    preload: preloadModules.import,
  },
]

export function AppSidebar() {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isPending, startTransition] = useTransition();
  const isMobile = useIsMobile();

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  const handleNavigation = (url: string) => {
    startTransition(() => {
      navigate(url);
    });
  };

  const filteredItems = items.filter(item => {
    if (item.adminOnly) {
      return hasPermission('manage_users');
    }
    return true;
  });

  return (
    <Sidebar className={isMobile ? "fixed inset-y-0 left-0 z-50 w-64" : ""}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Reklamasjonssystem</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.url || (item.url !== '/dashboard' && location.pathname.startsWith(item.url))}
                    className={isMobile ? "h-12 text-base" : ""}
                  >
                    <a 
                      href={item.url}
                      onMouseEnter={() => !isMobile && item.preload?.().catch(console.warn)}
                      onFocus={() => item.preload?.().catch(console.warn)}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavigation(item.url);
                      }}
                      className={isMobile ? "touch-manipulation" : ""}
                    >
                      <item.icon className={isMobile ? "w-5 h-5" : ""} />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4 border-t">
          <div className="text-sm text-gray-600 mb-2">
            Innlogget som: {user?.name}
          </div>
          <Button 
            variant="outline" 
            size={isMobile ? "default" : "sm"} 
            onClick={handleSignOut} 
            className={`w-full ${isMobile ? 'h-12 text-base touch-manipulation' : ''}`}
          >
            Logg ut
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
