
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuth } from '@/context/auth';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useAuthStore } from '@/hooks/auth/useAuthStore';

interface SidebarLayoutProps {
  // Bu interface-i boş saxlayırıq, çünki komponentə xarici proplar ötürülmür
}

const SidebarLayout: React.FC<SidebarLayoutProps> = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const { isDesktop } = useBreakpoint('md');

  // Check authentication status
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  // Desktop-da sidebar avtomatik açılır, mobilede bağlı olur
  useEffect(() => {
    if (isDesktop) {
      setIsSidebarOpen(true);
    } else {
      setIsSidebarOpen(false);
    }
  }, [isDesktop]);

  // Sidebar açıq/qapalı vəziyyətini idarə et
  const handleToggleSidebar = () => {
    setIsSidebarOpen(prevState => !prevState);
  };

  // Sidebar menusuna klik edildikdə mobil görünüşdə avtomatik bağla
  const handleMenuClick = () => {
    if (!isDesktop) {
      setIsSidebarOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className={`fixed inset-y-0 left-0 z-50 ${isSidebarOpen ? '' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:translate-x-0`}>
        <Sidebar 
          isOpen={isSidebarOpen} 
          onToggle={handleToggleSidebar} 
          onMenuClick={handleMenuClick}
        />
      </div>
      
      <div className="flex flex-col flex-1 w-full md:pl-[250px]">
        <Header 
          onSidebarToggle={handleToggleSidebar} 
          isSidebarOpen={isSidebarOpen} 
        />
        
        <main className="flex-1 p-4 overflow-y-auto">
          <div className="container mx-auto py-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
