
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

const menuItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: Home,
  },
  {
    title: 'Alle Reklamasjoner',
    url: '/claims',
    icon: FileText,
  },
  {
    title: 'Ny Reklamasjon',
    url: '/new-claim',
    icon: Plus,
  },
  {
    title: 'Leverandører',
    url: '/suppliers',
    icon: Users,
  },
  {
    title: 'Importer faktura',
    url: '/import',
    icon: Upload,
  },
  {
    title: 'Rapporter',
    url: '/reports',
    icon: BarChart3,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isAdmin, canManageUsers } = usePermissions();

  console.log('AppSidebar - User role:', user?.user_role, 'isAdmin:', isAdmin(), 'canManageUsers:', canManageUsers());

  // Check if user should see admin menu
  const showAdminMenu = user?.user_role === 'admin' || canManageUsers();
  
  // Combine regular menu items with admin items
  const allMenuItems = [...menuItems];
  
  if (showAdminMenu) {
    console.log('Adding admin menu items');
    allMenuItems.push({
      title: 'Brukere',
      url: '/admin/users',
      icon: Shield,
    });
  }

  console.log('All menu items:', allMenuItems.map(item => item.title));

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
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
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
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-2 p-2 bg-yellow-100 rounded text-xs">
                <p>Debug info:</p>
                <p>Role: {user?.user_role}</p>
                <p>Is Admin: {isAdmin() ? 'Yes' : 'No'}</p>
                <p>Can Manage Users: {canManageUsers() ? 'Yes' : 'No'}</p>
                <p>Show Admin Menu: {showAdminMenu ? 'Yes' : 'No'}</p>
                <p>Permissions: {user?.permissions?.join(', ') || 'None'}</p>
              </div>
            )}
          </div>
          <Button 
            variant="outline" 
            onClick={logout}
            className="w-full justify-start"
            size="sm"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logg ut
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
