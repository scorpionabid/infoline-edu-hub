
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  
  // Ekran ölçüsü dəyişikliklərinə reaksiya vermək üçün
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Əgər mobil ekrana keçdikdə sidebar açıqdırsa, onu bağlayaq
      if (mobile && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
      
      // Əgər desktop ekrana keçdikdə sidebar bağlıdırsa, onu açaq
      if (!mobile && !isSidebarOpen) {
        setIsSidebarOpen(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

  // Səhifə yükləndikdə ilkin olaraq mobil yoxlaması
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  // İstifadəçi autentifikasiya olmayıbsa, istifadəçini login səhifəsinə yönləndiririk
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Yükləmə halında
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

  const handleItemClick = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex">
        <div
          className={cn(
            "bg-background border-r h-full transition-all duration-300 ease-in-out",
            isSidebarOpen ? "w-[240px]" : "w-[70px]",
            isMobile && isSidebarOpen ? "fixed z-40 h-screen" : "",
            isMobile && !isSidebarOpen ? "hidden" : ""
          )}
        >
          <div className="flex items-center justify-between p-4">
            <div className={cn("transition-opacity", isSidebarOpen ? "opacity-100" : "opacity-0 hidden")}>
              <h2 className="text-xl font-bold">InfoLine</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
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
            onClick={() => setIsSidebarOpen(true)}
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
