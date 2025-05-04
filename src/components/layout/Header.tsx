
import React from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from '@/context/auth';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { MoonIcon, SunIcon } from '@radix-ui/react-icons';
import { useTheme } from '@/components/ui/theme-provider';
import { Button } from '@/components/ui/button';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isLoginPage = pathname.includes('/login');
  const isForgotPasswordPage = pathname.includes('/forgot-password');
  const { setTheme } = useTheme();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  let title = '';
  let subtitle = '';

  if (user && user.adminEntity) {
    if (user.role === 'regionadmin') {
      title = user.adminEntity.name || '';
      subtitle = user.adminEntity.type === 'regionadmin' ? t('regionAdmin') : '';
    } else if (user.role === 'sectoradmin') {
      title = user.adminEntity.name || '';
      subtitle = user.adminEntity.type === 'sectoradmin' ? t('sectorAdmin') : '';
    } else if (user.role === 'schooladmin') {
      title = user.adminEntity.name || '';
      subtitle = user.adminEntity.type === 'schooladmin' ? t('schoolAdmin') : '';
    }
  }
  
  if (isLoginPage || isForgotPasswordPage) return null;

  const userImage = user?.avatar || '';
  
  return (
    <div className="flex items-center justify-between p-4 bg-background sticky top-0 z-50 border-b">
      <div className="flex flex-col">
        <span className="font-bold">{title || t('dashboard')}</span>
        {subtitle && <span className="text-sm text-muted-foreground">{subtitle}</span>}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              {userImage ? (
                <AvatarImage src={userImage} alt={user?.full_name} />
              ) : (
                <AvatarFallback>{user?.full_name?.substring(0, 2)?.toUpperCase()}</AvatarFallback>
              )}
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel>{t('myAccount')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/profile')}>{t('profile')}</DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/settings')}>{t('settings')}</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>{t('logout')}</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setTheme("light")}>
            <SunIcon className="mr-2 h-4 w-4" />
            <span>{t('light')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            <MoonIcon className="mr-2 h-4 w-4" />
            <span>{t('dark')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")}>
            <SunIcon className="mr-2 h-4 w-4" />
            <span>{t('system')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Header;
