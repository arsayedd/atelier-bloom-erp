
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from '@/components/ui/sidebar';
import { Calendar, Home, User, Users, FileText, Database, Settings } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { name: 'Dashboard', icon: Home, path: '/dashboard' },
    { name: 'Clients', icon: Users, path: '/clients' },
    { name: 'Orders', icon: FileText, path: '/orders' },
    { name: 'Calendar', icon: Calendar, path: '/calendar' },
    { name: 'Inventory', icon: Database, path: '/inventory' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center px-4 py-3">
              <div className={`flex items-center space-x-2 ${collapsed ? 'justify-center w-full' : ''}`}>
                <div className="h-8 w-8 rounded-full bg-bloom-accent flex items-center justify-center">
                  <span className="font-semibold text-bloom-dark">AB</span>
                </div>
                {!collapsed && <span className="font-bold text-lg text-white">Atelier Bloom</span>}
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton asChild>
                        <Link to={item.path} className="flex items-center">
                          <item.icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          
          <SidebarFooter>
            <div className="px-4 py-3">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-bloom-primary/20 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                {!collapsed && (
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">{user?.name}</span>
                    <span className="text-xs text-gray-300">{user?.email}</span>
                  </div>
                )}
              </div>
              <Button 
                variant="outline" 
                className="mt-3 w-full text-white border-white/20 hover:bg-white/10"
                onClick={logout}
              >
                {collapsed ? <User className="h-4 w-4" /> : 'Logout'}
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        
        <div className="flex-1">
          <div className="container mx-auto py-6">
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
