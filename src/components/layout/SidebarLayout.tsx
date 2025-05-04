
import React, { ReactNode, useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import { ChevronLeft, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SidebarNav } from './SidebarNav';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import Header from './Header';

export interface SidebarLayoutProps {
  children?: ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { t } = useLanguage();
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  
  // İlkin yüklənmədə ekran ölçüsünü yoxlayırıq
  useEffect(() => {
    // İlk render zamanı mobil cihaz olub-olmadığını müəyyən edirik
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Mobil cihazda sidebar avtomatik bağlı olmalıdır
      if (mobile) {
        setIsSidebarOpen(false);
      }
    };
    
    checkMobile();
    
    // Ekran ölçüsü dəyişikliklərinə nəzarət
    const handleResize = () => {
      checkMobile();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // İstifadəçi autentifikasiya olmayıbsa, istifadəçini login səhifəsinə yönləndiririk
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Yönləndirmə zamanı cari səhifəni saxlayırıq
      navigate('/login', { state: { from: window.location.pathname } });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Sidebar üçün klik əməliyyatı
  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  // Mobil cihazlarda menu elementinə kliklədikdə sidebar bağlanmalıdır
  const handleItemClick = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  // Yüklənmə halında spinner göstəririk
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // İstifadəçi autentifikasiya olmayıbsa, sadəcə çıxış komponentini qaytarırıq
  if (!isAuthenticated || !user) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen flex flex-col w-full">
      <Header />
      
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div
          className={cn(
            "bg-background border-r h-full transition-all duration-300 ease-in-out relative",
            isSidebarOpen ? "w-[240px]" : "w-[70px]",
            isMobile && isSidebarOpen ? "fixed z-40 h-screen" : "",
            isMobile && !isSidebarOpen ? "hidden" : ""
          )}
        >
          <div className="flex items-center justify-between p-4">
            <div className={cn("transition-opacity", isSidebarOpen ? "opacity-100" : "opacity-0 hidden")}>
              <h2 className="text-xl font-bold">InfoLine</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSidebarToggle}>
              <ChevronLeft className={cn("h-5 w-5 transition-transform", !isSidebarOpen && "rotate-180")} />
            </Button>
          </div>
          
          <SidebarNav 
            isCollapsed={!isSidebarOpen} 
            isSidebarOpen={isSidebarOpen}
            onItemClick={handleItemClick}
          />
        </div>

        {/* Mobile sidebar toggle */}
        {isMobile && !isSidebarOpen && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="fixed top-16 left-4 z-30"
            onClick={handleSidebarToggle}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Main content */}
        <div 
          className={cn(
            "flex-1 p-6 overflow-y-auto transition-all duration-300",
            isMobile && isSidebarOpen ? "ml-[240px]" : ""
          )}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SidebarLayout;
