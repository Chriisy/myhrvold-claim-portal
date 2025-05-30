
import { Home, FileText, Users, BarChart3, UserCheck, Shield, Upload, Wrench } from "lucide-react"
import React, { useTransition, useEffect, useRef } from "react"

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
import { useIsMobile } from "@/hooks/use-mobile"
import { useQueryClient } from "@tanstack/react-query"
import PrefetchService, { ROUTE_PREFETCH_CONFIGS } from "@/services/performance/prefetchService"

// Menu items with enhanced prefetch configurations
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    routeKey: "dashboard" as keyof typeof ROUTE_PREFETCH_CONFIGS,
  },
  {
    title: "Reklamasjoner",
    url: "/claims",
    icon: FileText,
    routeKey: "claims" as keyof typeof ROUTE_PREFETCH_CONFIGS,
  },
  {
    title: "Installasjoner",
    url: "/installations",
    icon: Wrench,
    routeKey: "installations" as keyof typeof ROUTE_PREFETCH_CONFIGS,
  },
  {
    title: "Leverandører",
    url: "/suppliers",
    icon: Users,
    routeKey: "suppliers" as keyof typeof ROUTE_PREFETCH_CONFIGS,
  },
  {
    title: "Rapporter",
    url: "/reports",
    icon: BarChart3,
    routeKey: "reports" as keyof typeof ROUTE_PREFETCH_CONFIGS,
  },
  {
    title: "Brukere",
    url: "/users",
    icon: UserCheck,
    adminOnly: true,
    routeKey: "users" as keyof typeof ROUTE_PREFETCH_CONFIGS,
  },
  {
    title: "F-gass Sertifikater",
    url: "/certificates",
    icon: Shield,
    routeKey: "certificates" as keyof typeof ROUTE_PREFETCH_CONFIGS,
  },
  {
    title: "Import",
    url: "/import",
    icon: Upload,
    routeKey: "import" as keyof typeof ROUTE_PREFETCH_CONFIGS,
  },
]

export function AppSidebar() {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isPending, startTransition] = useTransition();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  
  const prefetchService = useRef<PrefetchService>();
  const prefetchedRoutes = useRef<Set<string>>(new Set());

  // Initialize prefetch service
  useEffect(() => {
    prefetchService.current = new PrefetchService(queryClient);
    
    // Prefetch critical data on app load
    prefetchService.current.prefetchCriticalData();
  }, [queryClient]);

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  const handleNavigation = (url: string) => {
    startTransition(() => {
      navigate(url);
    });
  };

  const handlePrefetch = (routeKey: keyof typeof ROUTE_PREFETCH_CONFIGS) => {
    if (!prefetchService.current || prefetchedRoutes.current.has(routeKey)) {
      return;
    }

    const config = ROUTE_PREFETCH_CONFIGS[routeKey];
    if (config) {
      prefetchService.current.prefetchRoute(routeKey, config);
      prefetchedRoutes.current.add(routeKey);
    }
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
                      onMouseEnter={() => !isMobile && handlePrefetch(item.routeKey)}
                      onFocus={() => handlePrefetch(item.routeKey)}
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
