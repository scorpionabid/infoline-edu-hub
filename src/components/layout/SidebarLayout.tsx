
import React, { ReactNode, useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
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

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { t } = useLanguage();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  const location = useLocation();
  
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
  }, []);

  // Autentifikasiya yoxlaması
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Yüklənmə halında spinner göstəririk
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleItemClick = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div 
          className={cn(
            "bg-background border-r transition-all duration-300 ease-in-out z-20 h-full",
            isSidebarOpen ? "w-64" : "w-0 md:w-16",
            isMobile && isSidebarOpen ? "fixed inset-y-0 left-0 h-full" : "",
            isMobile && !isSidebarOpen ? "hidden" : ""
          )}
        >
          <div className="flex flex-col h-full">
            <div className="p-4 flex items-center justify-between border-b">
              <div className={cn("flex items-center", !isSidebarOpen && "md:hidden")}>
                <div className="bg-primary w-8 h-8 rounded-md flex items-center justify-center text-primary-foreground font-bold text-lg">
                  I
                </div>
                <span className={cn("font-semibold text-lg ml-2", !isSidebarOpen && "md:hidden")}>InfoLine</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleSidebar}
              >
                {isSidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
              </Button>
            </div>
            
            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-2">
              <SidebarNav 
                onItemClick={handleItemClick} 
                isSidebarOpen={isSidebarOpen} 
                isCollapsed={!isSidebarOpen}
              />
            </div>
          </div>
        </div>
        
        {/* Mobile overlay */}
        {isSidebarOpen && isMobile && (
          <div 
            className="fixed inset-0 bg-black/50 z-10" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
