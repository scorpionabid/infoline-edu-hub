
import React, { ReactNode, useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { ChevronLeft, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SidebarNav } from './SidebarNav';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import Header from './Header';
import LoadingScreen from '@/components/auth/LoadingScreen';

export interface SidebarLayoutProps {
  children?: ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = () => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
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
      // Bir dəfə yoxlayırıq və dərhal çıxırıq
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
    return <LoadingScreen message="Zəhmət olmasa gözləyin..." />;
  }
  
  // İstifadəçi autentifikasiya olmayıbsa, sadəcə çıxış komponentini qaytarırıq
  if (!isAuthenticated || !user) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <Header />
      
      <div className="flex-1 flex relative">
        {/* Mobil overlay arxa fonu */}
        {isMobile && isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <aside
          className={cn(
            "bg-background border-r z-40 transition-all duration-300 ease-in-out",
            isSidebarOpen ? "w-64" : "w-[70px]",
            isMobile ? (isSidebarOpen ? "fixed h-full" : "hidden") : "h-full"
          )}
        >
          <div className="flex items-center justify-between p-4">
            <div className={cn("transition-opacity", isSidebarOpen ? "opacity-100" : "opacity-0 hidden")}>
              <h2 className="text-xl font-bold">InfoLine</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSidebarToggle} className="flex-shrink-0">
              <ChevronLeft className={cn("h-5 w-5 transition-transform", !isSidebarOpen && "rotate-180")} />
            </Button>
          </div>
          
          <SidebarNav 
            isCollapsed={!isSidebarOpen} 
            isSidebarOpen={isSidebarOpen}
            onItemClick={handleItemClick}
          />
        </aside>

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
            isMobile ? "w-full" : (isSidebarOpen ? "ml-64" : "ml-[70px]")
          )}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SidebarLayout;
