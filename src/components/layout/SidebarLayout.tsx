
import React, { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import { Loader2, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import SidebarNav from './SidebarNav';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';

interface SidebarLayoutProps {
  children: ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { t } = useLanguage();

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
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div 
          className={cn(
            "bg-background border-r transition-all duration-300 ease-in-out",
            isSidebarOpen ? "w-64" : "w-0 md:w-16",
            "overflow-hidden z-20 fixed h-full md:relative"
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
                className="md:hidden"
              >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            </div>
            
            {/* User Info */}
            {user && (
              <div className={cn("px-4 py-3 border-b", !isSidebarOpen && "md:hidden")}>
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
              <SidebarNav onItemClick={() => setIsSidebarOpen(false)} isSidebarOpen={isSidebarOpen} />
            </div>
          </div>
        </div>
        
        {/* Mobile overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-10 md:hidden" 
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
              className="mr-2"
            >
              <Menu size={20} />
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
