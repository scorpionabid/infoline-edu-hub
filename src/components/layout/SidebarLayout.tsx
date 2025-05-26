
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import Sidebar from './Sidebar';
import Header from './Header';
import { Loader2 } from 'lucide-react';
import { useAuthStore, selectIsLoading, selectUser } from '@/hooks/auth/useAuthStore';

interface SidebarComponentProps {
  onClose: () => void;
}

interface HeaderComponentProps {
  onMenuClick: () => void;
}

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
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          {React.createElement(Sidebar as any, { onClose: () => setSidebarOpen(false) })}
        </div>

        {/* Main content */}
        <div className="flex flex-col flex-1 lg:pl-64">
          {/* Header */}
          {React.createElement(Header as any, { onMenuClick: () => setSidebarOpen(!sidebarOpen) })}
          
          {/* Page content */}
          <main className="flex-1 overflow-auto p-4">
            {children || <Outlet />}
          </main>
        </div>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default SidebarLayout;
