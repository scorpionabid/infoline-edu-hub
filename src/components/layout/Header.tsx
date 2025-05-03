
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/auth';
import LanguageSelector from '../LanguageSelector';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getInitials } from '@/utils/helpers';
import { LogOut, User, Settings } from 'lucide-react';
import ThemeToggle from '../ThemeToggle';
import NotificationComponent from '../notifications/NotificationComponent';

const Header: React.FC = () => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  
  const userFullName = user?.full_name || user?.email || '';
  
  // İstifadəçinin aid olduğu müəssisə adını hazırlayaq
  const getEntityName = () => {
    if (!user) return '';
    
    if (user.role === 'schooladmin' && user.adminEntity?.name) {
      return `${user.adminEntity.name} - ${t('schoolAdmin')}`;
    } else if (user.role === 'sectoradmin' && user.adminEntity?.name) {
      return `${user.adminEntity.name} - ${t('sectorAdmin')}`;
    } else if (user.role === 'regionadmin' && user.adminEntity?.name) {
      return `${user.adminEntity.name} - ${t('regionAdmin')}`;
    } else if (user.role === 'superadmin') {
      return t('superAdmin');
    }
    
    return 'InfoLine';
  };

  return (
    <header className="border-b bg-background">
      <div className="flex h-16 items-center px-4 justify-between">
        <div className="font-semibold text-lg hidden md:block truncate max-w-md">
          {getEntityName()}
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <LanguageSelector />
          
          {user && <NotificationComponent />}
          
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || ''} alt={userFullName} />
                    <AvatarFallback>{getInitials(userFullName)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userFullName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>{t('profile')}</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{t('settings')}</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
