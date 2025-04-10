
import React, { useState, useEffect, Suspense } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import NotificationControl from '../notifications/NotificationControl';
import { useNotifications } from '@/context/NotificationContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import SidebarNav from './SidebarNav';
import { Logo, SidebarContainer, EntityInfo } from '@/components/ui/sidebar';
import UserProfile from './UserProfile';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { notifications, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isDesktop && open) {
      setOpen(false);
    }
  }, [isDesktop, open]);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const sidebarContent = (
    <SidebarContainer>
      <div className="p-6">
        <Link to="/dashboard" className="no-underline text-inherit">
          <Logo />
        </Link>
      </div>
      
      {user && <EntityInfo user={user} />}
      
      <SidebarNav onItemClick={() => setOpen(false)} />
      
      <UserProfile onLogout={handleLogout} />
    </SidebarContainer>
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
              <Link to="/dashboard" className="no-underline text-inherit">
                <Logo />
              </Link>
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
          <Suspense fallback={<div className="animate-pulse p-4">Yüklənir...</div>}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
