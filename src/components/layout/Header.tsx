
import React from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import UserProfile from './UserProfile';
import LanguageSwitcher from './LanguageSwitcher';
import NavigationMenu from './NavigationMenu';
import ThemeToggle from '@/components/ThemeToggle';
import { useMobile } from '@/hooks/common/useMobile';
import { useTranslation } from '@/contexts/TranslationContext';

interface HeaderProps {
  onSidebarToggle?: () => void;
  isSidebarOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onSidebarToggle, isSidebarOpen }) => {
  const isMobile = useMobile();
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur w-full">
      <div className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 lg:px-6 w-full">
        <div className="flex items-center min-w-0 flex-1">
          {/* Mobile sidebar toggle */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="mr-3 flex-shrink-0 min-h-[44px] min-w-[44px] touch-manipulation"
              onClick={onSidebarToggle}
              aria-label={isSidebarOpen ? 'Menyunu bağla' : 'Menyunu aç'}
            >
              {isSidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          )}
          
          {/* Mobile: Show logo/title when sidebar is closed */}
          {isMobile && (
            <div className="flex items-center">
              <span className="font-semibold text-sm sm:text-base text-primary">
                InfoLine
              </span>
            </div>
          )}
        </div>
        
        {/* Right side controls - using icons primarily */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <LanguageSwitcher showLabels={false} />
          <ThemeToggle />
          <UserProfile />
        </div>
      </div>
    </header>
  );
};

export default Header;
