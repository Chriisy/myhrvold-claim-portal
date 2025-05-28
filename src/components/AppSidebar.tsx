
import { Home, FileText, Users, BarChart3, UserCheck, Shield, Upload, Wrench } from "lucide-react"

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

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Reklamasjoner",
    url: "/claims",
    icon: FileText,
  },
  {
    title: "Installasjoner",
    url: "/installations",
    icon: Wrench,
  },
  {
    title: "Leverandører",
    url: "/suppliers",
    icon: Users,
  },
  {
    title: "Rapporter",
    url: "/reports",
    icon: BarChart3,
  },
  {
    title: "Brukere",
    url: "/users",
    icon: UserCheck,
    adminOnly: true,
  },
  {
    title: "F-gass Sertifikater",
    url: "/certificates",
    icon: Shield,
  },
  {
    title: "Import",
    url: "/import",
    icon: Upload,
  },
]

export function AppSidebar() {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  const filteredItems = items.filter(item => {
    if (item.adminOnly) {
      return hasPermission('manage_users');
    }
    return true;
  });

  return (
    <Sidebar>
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
                  >
                    <a href={item.url}>
                      <item.icon />
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
          <Button variant="outline" size="sm" onClick={handleSignOut} className="w-full">
            Logg ut
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
