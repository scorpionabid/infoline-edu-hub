
import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationMenu from './NavigationMenu';
import { useAuth } from '@/context/auth/useAuth';
import { Loader2 } from 'lucide-react';

interface SidebarLayoutProps {
  children: ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user, isLoading, logout } = useAuth(); // logout əvəzinə düzəliş

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
      <NavigationMenu />
      <main className="flex-1 container py-6">
        {children}
      </main>
    </div>
  );
};

export default SidebarLayout;
