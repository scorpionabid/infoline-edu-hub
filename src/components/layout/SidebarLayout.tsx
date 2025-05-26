
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
        {/* Sidebar - Mobile overlay */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out
          md:translate-x-0 md:static md:inset-0 md:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <Sidebar 
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(false)}
          />
        </div>

        {/* Main content area */}
        <div className="flex flex-col flex-1 w-full min-w-0 md:ml-0">
          {/* Header */}
          <Header 
            onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
            isSidebarOpen={sidebarOpen}
          />
          
          {/* Page content */}
          <main className="flex-1 overflow-auto p-3 md:p-4 w-full">
            <div className="w-full max-w-full">
              {children || <Outlet />}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default SidebarLayout;
