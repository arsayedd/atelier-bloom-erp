
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Calendar,
  Users,
  ShoppingBag,
  Package,
  BarChart2,
  CreditCard,
  Settings,
  Menu,
  LogOut,
  X
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useMobile } from '@/hooks/use-mobile';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  active: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, path, active }) => {
  return (
    <Link
      to={path}
      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
        active 
          ? 'bg-bloom-primary text-white' 
          : 'hover:bg-bloom-primary/10 text-gray-600 hover:text-bloom-primary'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation();
  const isMobile = useMobile();
  const [open, setOpen] = useState(false);
  const { logout, profile } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'لوحة المعلومات', path: '/dashboard' },
    { icon: <Calendar size={20} />, label: 'التقويم', path: '/calendar' },
    { icon: <Users size={20} />, label: 'العملاء', path: '/clients' },
    { icon: <ShoppingBag size={20} />, label: 'الطلبات', path: '/orders' },
    { icon: <Package size={20} />, label: 'المخزون', path: '/inventory' },
    { icon: <BarChart2 size={20} />, label: 'التقارير', path: '/reports' },
    { icon: <CreditCard size={20} />, label: 'المدفوعات', path: '/payments' },
    { icon: <Settings size={20} />, label: 'الإعدادات', path: '/settings' },
  ];

  const renderNavItems = () => (
    <div className="flex flex-col gap-1 mt-6">
      {navItems.map((item) => (
        <NavItem
          key={item.path}
          icon={item.icon}
          label={item.label}
          path={item.path}
          active={location.pathname === item.path}
        />
      ))}
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      {!isMobile && (
        <aside className="w-64 p-4 bg-white border-r overflow-y-auto">
          <div className="flex items-center justify-center mb-6">
            <h1 className="text-2xl font-bold text-bloom-primary">Atelier Bloom</h1>
          </div>
          {renderNavItems()}
          <div className="mt-auto pt-6">
            <Separator className="my-4" />
            <div className="flex items-center gap-3 px-3 py-2">
              <Avatar>
                <AvatarFallback>{profile?.full_name ? profile.full_name.charAt(0) : '?'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{profile?.full_name || 'المستخدم'}</p>
                <p className="text-xs text-gray-500">{profile?.email || ''}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full mt-2 text-red-500 hover:text-red-600 hover:bg-red-50" 
              onClick={handleLogout}
            >
              <LogOut size={18} className="mr-2" />
              تسجيل الخروج
            </Button>
          </div>
        </aside>
      )}
      
      {/* Main content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        {/* Mobile header with menu trigger */}
        {isMobile && (
          <div className="sticky top-0 z-30 bg-white border-b p-4">
            <div className="flex items-center justify-between">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    {open ? <X size={20} /> : <Menu size={20} />}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="p-0">
                  <div className="p-4">
                    <h1 className="text-2xl font-bold text-bloom-primary text-center mb-6">Atelier Bloom</h1>
                    {renderNavItems()}
                    <Separator className="my-4" />
                    <div className="flex items-center gap-3 px-3 py-2">
                      <Avatar>
                        <AvatarFallback>{profile?.full_name ? profile.full_name.charAt(0) : '?'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{profile?.full_name || 'المستخدم'}</p>
                        <p className="text-xs text-gray-500">{profile?.email || ''}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      className="w-full mt-2 text-red-500 hover:text-red-600 hover:bg-red-50" 
                      onClick={handleLogout}
                    >
                      <LogOut size={18} className="mr-2" />
                      تسجيل الخروج
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
              <h1 className="text-xl font-bold text-bloom-primary">Atelier Bloom</h1>
              <div className="w-9"> {/* Empty div for balance */}</div>
            </div>
          </div>
        )}
        
        {/* Page content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
