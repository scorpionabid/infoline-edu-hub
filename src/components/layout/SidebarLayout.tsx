
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { Loader2 } from 'lucide-react';
import { useAuthStore, selectIsLoading, selectUser } from '@/hooks/auth/useAuthStore';

interface SidebarLayoutProps {
  children?: React.ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const isLoading = useAuthStore(selectIsLoading);
  const user = useAuthStore(selectUser);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  console.log('[SidebarLayout] Render state:', { user: !!user, isLoading });

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
        {/* Sidebar - Desktop: Always visible, Mobile: Overlay */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0 lg:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <Sidebar 
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(false)}
          />
        </div>

        {/* Main content area */}
        <div className="flex flex-col flex-1 w-full min-w-0">
          {/* Header */}
          <Header 
            onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
            isSidebarOpen={sidebarOpen}
          />
          
          {/* Page content with responsive padding and animation */}
          <main className="flex-1 overflow-auto p-2 sm:p-4 lg:p-6 w-full">
            <div className="w-full max-w-full mx-auto animate-fade-in-up">
              {children || <Outlet />}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile sidebar overlay - only show on smaller screens */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default SidebarLayout;
