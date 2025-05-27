
import { Home, FileText, Plus, Users, BarChart3, Upload, Settings, LogOut, Shield } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const menuItems = [
  {
    title: 'Dashboard',
    url: '/',
    icon: Home,
    badge: null,
  },
  {
    title: 'Alle Reklamasjoner',
    url: '/claims',
    icon: FileText,
    badge: '9', // This would come from API in real app
  },
  {
    title: 'Ny Reklamasjon',
    url: '/claim/new',
    icon: Plus,
    badge: null,
  },
  {
    title: 'Leverandører',
    url: '/suppliers',
    icon: Users,
    badge: null,
  },
  {
    title: 'Importer faktura',
    url: '/import',
    icon: Upload,
    badge: null,
  },
  {
    title: 'Rapporter',
    url: '/reports',
    icon: BarChart3,
    badge: null,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isAdmin, canManageUsers } = usePermissions();

  const showAdminMenu = user?.user_role === 'admin' || canManageUsers();
  
  const allMenuItems = [...menuItems];
  
  if (showAdminMenu) {
    allMenuItems.push({
      title: 'Brukere',
      url: '/admin/users',
      icon: Shield,
      badge: null,
    });
  }

  return (
    <Sidebar className="border-r border-myhrvold-border">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-myhrvold-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <div>
            <h2 className="font-semibold text-myhrvold-primary">Myhrvold</h2>
            <p className="text-sm text-gray-600">Reklamasjon Portal</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Hovedmeny</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {allMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <Link to={item.url} className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors">
                      <item.icon className="w-5 h-5" strokeWidth={2} />
                      <span className="flex-1">{item.title}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-6">
        <div className="space-y-3">
          <div className="text-sm">
            <p className="font-medium text-myhrvold-primary">{user?.name}</p>
            <p className="text-gray-600">{user?.email}</p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.user_role} {user?.user_role === 'admin' && '(Administrator)'}
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={logout}
            className="w-full justify-start"
            size="sm"
          >
            <LogOut className="w-4 h-4 mr-2" strokeWidth={2} />
            Logg ut
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
