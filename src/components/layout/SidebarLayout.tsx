
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  X, 
  Home, 
  FileInput, 
  PieChart, 
  Users, 
  School, 
  FolderKanban, 
  Settings, 
  MapPin, 
  Building, 
  Columns 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import NotificationControl from '../notifications/NotificationControl';
import { useNotifications } from '@/context/NotificationContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

const Logo = () => (
  <div className="flex items-center space-x-2">
    <div className="bg-primary w-8 h-8 rounded-md flex items-center justify-center text-primary-foreground font-bold text-lg">I</div>
    <span className="font-semibold text-lg">InfoLine</span>
  </div>
);

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, label, isActive, onClick }) => (
  <Link
    to={href}
    className={cn(
      "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
      isActive
        ? "bg-primary/10 text-primary font-medium"
        : "text-muted-foreground hover:bg-muted"
    )}
    onClick={onClick}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { notifications, markAsRead, markAllAsRead, clearAll } = useNotifications();
  
  useEffect(() => {
    if (isDesktop && open) {
      setOpen(false);
    }
  }, [isDesktop, open]);
  
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  
  // Rolu dəqiqləşdirək
  const userRole = user?.role || '';
  
  // Hər bir naviqasiya elementi üçün göstərilmə şərtlərini təyin edirik
  const navItems = [
    {
      href: "/dashboard",
      icon: <Home size={20} />,
      label: t('dashboard'),
      roles: ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin']
    },
    {
      href: "/regions",
      icon: <MapPin size={20} />,
      label: t('regions'),
      roles: ['superadmin']
    },
    {
      href: "/sectors",
      icon: <Building size={20} />,
      label: t('sectors'),
      roles: ['superadmin', 'regionadmin']
    },
    {
      href: "/schools",
      icon: <School size={20} />,
      label: t('schools'),
      roles: ['superadmin', 'regionadmin', 'sectoradmin']
    },
    {
      href: "/categories",
      icon: <FolderKanban size={20} />,
      label: t('categories'),
      roles: ['superadmin', 'regionadmin']
    },
    {
      href: "/columns",
      icon: <Columns size={20} />,
      label: t('columns'),
      roles: ['superadmin', 'regionadmin']
    },
    {
      href: "/users",
      icon: <Users size={20} />,
      label: t('users'),
      roles: ['superadmin', 'regionadmin']
    },
    {
      href: "/data-entry",
      icon: <FileInput size={20} />,
      label: t('dataEntry'),
      roles: ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin']
    },
    {
      href: "/reports",
      icon: <PieChart size={20} />,
      label: t('reports'),
      roles: ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin']
    },
    {
      href: "/settings",
      icon: <Settings size={20} />,
      label: t('settings'),
      roles: ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin']
    }
  ];
  
  // İstifadəçinin roluna əsasən filtrlənmiş naviqasiya elementləri
  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(userRole)
  );
  
  const handleLogout = async () => {
    try {
      await logout();
      // No need to navigate - the AuthContext should handle it
    } catch (error) {
      console.error('Çıxış zamanı xəta:', error);
    }
  };
  
  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <Logo />
      </div>
      
      <div className="flex-1 px-3 py-2 space-y-1">
        {filteredNavItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isActive={pathname === item.href}
          />
        ))}
      </div>
      
      <div className="p-4 border-t">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{t(user?.role || '')}</p>
          </div>
        </div>
        
        <div className="space-y-1">
          <NavItem
            href="/profile"
            icon={<Settings size={20} />}
            label={t('profile')}
            isActive={pathname === '/profile'}
          />
          <Button
            variant="ghost"
            className="w-full justify-start px-3 py-2 text-muted-foreground hover:bg-muted"
            onClick={handleLogout}
          >
            {t('logout')}
          </Button>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r">
        {sidebarContent}
      </div>
      
      <div className="flex-1">
        <header className="h-16 border-b flex items-center justify-between px-4 lg:px-6 lg:justify-end">
          <div className="flex items-center lg:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0">
                {sidebarContent}
              </SheetContent>
            </Sheet>
            <div className="ml-3">
              <Logo />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <NotificationControl
              notifications={notifications}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
              onClearAll={clearAll}
            />
            
            <Link to="/profile">
              <Button variant="ghost" size="icon" className="rounded-full">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </Button>
            </Link>
          </div>
        </header>
        
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
