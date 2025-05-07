
import React from 'react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useAuth } from '@/context/auth';
import { UserProfile } from './UserProfile';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/auth/usePermissions';

export const Header = () => {
  const { isAuthenticated } = useAuth();
  const { isSuperAdmin, isRegionAdmin } = usePermissions();
  const navigate = useNavigate();
  
  // Örnək bildiriş sayı (əsl sistemdə bu API-dən gələcək)
  const notificationCount = 5;
  
  // Admin panelə keçid
  const goToAdmin = () => {
    navigate('/admin');
  };

  return (
    <header className="border-b sticky top-0 z-50 w-full bg-background">
      <div className="max-w-7xl mx-auto flex justify-between items-center p-3">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">InfoLine</h1>
          
          {(isSuperAdmin || isRegionAdmin) && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={goToAdmin}
              className="hidden md:flex"
            >
              Admin Panel
            </Button>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          
          {isAuthenticated && (
            <>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
                    variant="destructive"
                  >
                    {notificationCount}
                  </Badge>
                )}
              </Button>
              
              <UserProfile />
            </>
          )}
          
          {!isAuthenticated && (
            <Button size="sm" onClick={() => navigate('/login')}>
              Giriş
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
