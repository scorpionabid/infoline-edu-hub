
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import Sidebar from './Sidebar';
import Header from './Header';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/hooks/auth/useAuthStore';

// İnterfeysləri yerində təyin edirik
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
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Debug loqu əlavə edirik
  useEffect(() => {
    console.log('SidebarLayout rendering with:', { user, loading });
    
    // 10 saniyə sonra yüklənmə vəziyyətini sıfırla
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('SidebarLayout loading timeout triggered');
        // useAuthStore-dan istifadə edərək isLoading-i sıfırla
        useAuthStore.setState({ isLoading: false });
      }
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, [user, loading]);

  if (loading) {
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
          {/* TypeScript xətasından qaçmaq üçün (any) tipindən istifadə edirik */}
          {React.createElement(Sidebar as any, { onClose: () => setSidebarOpen(false) })}
        </div>

        {/* Main content */}
        <div className="flex flex-col flex-1 lg:ml-0">
          {/* Header */}
          {/* TypeScript xətasından qaçmaq üçün (any) tipindən istifadə edirik */}
          {React.createElement(Header as any, { onMenuClick: () => setSidebarOpen(!sidebarOpen) })}
          
          {/* Page content */}
          <main className="flex-1 overflow-auto">
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
