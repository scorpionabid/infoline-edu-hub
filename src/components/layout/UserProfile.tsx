
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { NavItem } from '@/components/ui/sidebar';

const UserProfile: React.FC<{ onLogout?: () => void }> = ({ onLogout }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="p-4 border-t">
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{user?.name}</p>
          <p className="text-xs text-muted-foreground truncate">{t(user?.role || '')}</p>
        </div>
      </div>
      
      <div className="space-y-1">
        <NavItem
          href="/profile"
          icon={<User size={18} />}
          label={t('profile')}
          isActive={pathname === '/profile'}
        />
        <NavItem
          href="/settings"
          icon={<Settings size={18} />}
          label={t('settings')}
          isActive={pathname === '/settings'}
        />
        <Button
          variant="ghost"
          className="w-full justify-start px-3 py-2 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
          onClick={handleLogout}
        >
          <LogOut size={18} className="mr-2" />
          {t('logout')}
        </Button>
      </div>
    </div>
  );
};

export default UserProfile;
