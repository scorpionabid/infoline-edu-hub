
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/theme/ModeToggle';
import LanguageSelector from '@/components/language/LanguageSelector';
import { User, LogOut } from 'lucide-react';
import NotificationSystem from '@/components/notifications/NotificationSystem';

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title = 'InfoLine' }) => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="mr-4 flex">
          <a href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">{title}</span>
          </a>
        </div>
        <div className="flex items-center space-x-4">
          <NotificationSystem />
          <LanguageSelector />
          <ModeToggle />
          {user ? (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => logout()} 
                title={t('logout')}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Button variant="default" size="sm" asChild>
              <a href="/login">{t('login')}</a>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
