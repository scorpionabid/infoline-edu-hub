
import React, { ReactNode, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import { Loader2, Menu, X, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SidebarNav } from './SidebarNav'; // Burada named export istifadə edirik
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import Header from './Header';

interface SidebarLayoutProps {
  children: ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { t } = useLanguage();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">  
      <Header />
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div 
          className={cn(
            "bg-background border-r transition-all duration-300 ease-in-out z-20 h-full",
            isSidebarOpen ? "w-64" : "w-0 md:w-16",
            isMobile ? "fixed" : "relative"
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
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                {isSidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
              </Button>
            </div>
            
            {/* User Info */}
            {user && isSidebarOpen && (
              <div className="px-4 py-3 border-b">
                <div className="font-medium truncate">
                  {user.full_name}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {t(user.role as string)}
                </div>
              </div>
            )}
            
            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-2">
              <SidebarNav onItemClick={() => isMobile && setIsSidebarOpen(false)} isSidebarOpen={isSidebarOpen} />
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
        <main className={cn(
          "flex-1 overflow-auto",
          "transition-all duration-300"
        )}>
          <div className="sticky top-0 z-10 bg-background border-b flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
            <div className="flex-1" />
            {/* Burada digər üst panel elementlərini əlavə edə bilərsiniz */}
          </div>
          
          <div className="p-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
