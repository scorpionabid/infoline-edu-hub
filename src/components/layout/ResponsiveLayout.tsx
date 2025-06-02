
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileSidebar from '@/components/navigation/MobileSidebar';
import { useMobile } from '@/hooks/common/useMobile';
import { useAuthStore, selectIsLoading, selectUser } from '@/hooks/auth/useAuthStore';
import { Loader2 } from 'lucide-react';

interface ResponsiveLayoutProps {
  children?: React.ReactNode;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children }) => {
  const isLoading = useAuthStore(selectIsLoading);
  const user = useAuthStore(selectUser);
  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  console.log('[ResponsiveLayout] Render state:', { user: !!user, isLoading, isMobile });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>İstifadəçi məlumatları yüklənir...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background w-full">
      <div className="flex h-screen w-full">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <div className="hidden lg:flex w-64 bg-card border-r border-border">
            <Sidebar 
              isOpen={true}
              onToggle={() => {}}
            />
          </div>
        )}

        {/* Mobile Sidebar */}
        {isMobile && (
          <MobileSidebar 
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />
        )}

        {/* Main content area */}
        <div className="flex flex-col flex-1 w-full min-w-0">
          {/* Header */}
          <Header 
            onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
            isSidebarOpen={sidebarOpen}
          />
          
          {/* Page content with responsive padding */}
          <main className="flex-1 overflow-auto w-full">
            <div className="w-full max-w-full mx-auto p-2 sm:p-4 lg:p-6">
              {children || <Outlet />}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default ResponsiveLayout;
