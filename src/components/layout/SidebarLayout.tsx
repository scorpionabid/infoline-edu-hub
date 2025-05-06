
import React, { ReactNode, useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const isInitialMount = useRef(true);
  const [redirectInProgress, setRedirectInProgress] = useState(false);
  
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

  // İstifadəçi autentifikasiya olmayıbsa və yüklənmə bitibsə, istifadəçini login səhifəsinə yönləndiririk
  // Ancaq loop qarşısını almaq üçün əlavə nəzarət mexanizmləri əlavə edirik
  useEffect(() => {
    // İlk render və ya redirect prosesi zamanı heç nə etmirik
    if (isInitialMount.current || redirectInProgress) {
      isInitialMount.current = false;
      return;
    }

    // Yalnız vəziyyət müəyyən olduqda və autentifikasiya aparılmadıqda yönləndiririk
    if (!isLoading && !isAuthenticated) {
      // Redirekt loop qarşısını almaq üçün yoxlayırıq
      if (location.pathname !== '/login' && !redirectInProgress) {
        console.log('Autentifikasiya olmayıb, login səhifəsinə yönləndirilir');
        
        // Redirect işarəsini qeyd edirik
        setRedirectInProgress(true);
        
        // Bir qədər gecikmə ilə yönləndirməni həyata keçiririk (loop qarşısını almaq üçün)
        setTimeout(() => {
          navigate('/login', { state: { from: location } });
          
          // Bir müddət sonra redirect işarəsini təmizləyirik
          setTimeout(() => {
            setRedirectInProgress(false);
          }, 1000);
        }, 100);
      }
    } else if (isAuthenticated && user) {
      console.log('Autentifikasiya uğurlu: ', user.role);
    }
  }, [isAuthenticated, isLoading, navigate, location, redirectInProgress, user]);

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
    console.log('SidebarLayout: İstifadəçi autentifikasiya olmayıb, Outlet qaytarılır');
    return <Outlet />;
  }
  
  console.log('SidebarLayout: İstifadəçi autentifikasiya olunub, layout göstərilir');

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <Header />
      
      <div className="flex-1 flex relative">
        {/* Mobil arxa fonu */}
        {isMobile && isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
        
        {/* Sidebar */}
        <div
          className={cn(
            "h-[calc(100vh-3.5rem)] bg-background border-r z-50 transition-all duration-300 ease-in-out",
            isSidebarOpen ? "w-48" : "w-12",
            isMobile ? (
              isSidebarOpen ? "fixed left-0" : "fixed -left-full"
            ) : (
              "relative"
            )
          )}
        >
          <div className="flex items-center justify-between p-2">
            <div className={cn("transition-opacity", isSidebarOpen ? "opacity-100" : "opacity-0 md:hidden")}>
              <h2 className="text-sm font-bold">InfoLine</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSidebarToggle} className="flex-shrink-0 h-6 w-6">
              <ChevronLeft className={cn("h-4 w-4 transition-transform", !isSidebarOpen && "rotate-180")} />
            </Button>
          </div>
          
          <SidebarNav 
            isCollapsed={!isSidebarOpen} 
            isSidebarOpen={isSidebarOpen}
            onItemClick={handleItemClick}
          />
        </div>

        {/* Mobile sidebar toggle button */}
        {isMobile && !isSidebarOpen && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="fixed top-16 left-2 z-50 h-8 w-8"
            onClick={handleSidebarToggle}
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}

        {/* Main content */}
        <div 
          className={cn(
            "flex-1 overflow-y-auto transition-all duration-300",
            isMobile ? "px-2 py-2" : (isSidebarOpen ? "md:ml-48 px-3 py-3" : "md:ml-12 px-3 py-3")
          )}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SidebarLayout;
