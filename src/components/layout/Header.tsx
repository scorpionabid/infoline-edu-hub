
import React from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import UserProfile from './UserProfile';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from '@/components/ThemeToggle';
import { useMobile } from '@/hooks/common/useMobile';

interface HeaderProps {
  onSidebarToggle?: () => void;
  isSidebarOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onSidebarToggle, isSidebarOpen }) => {
  const isMobile = useMobile();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur w-full">
      <div className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 lg:px-6 w-full">
        <div className="flex items-center min-w-0 flex-1">
          {/* Mobile sidebar toggle */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="mr-3 flex-shrink-0 min-h-[44px] min-w-[44px] touch-manipulation hover-lift"
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
            <div className="flex items-center animate-fade-in-left">
              <span className="font-semibold text-sm sm:text-base text-primary gradient-text">
                InfoLine
              </span>
            </div>
          )}
        </div>
        
        {/* Right side controls - Icon-only design */}
        <div className="flex items-center gap-1 flex-shrink-0 animate-fade-in-right">
          <LanguageSwitcher variant="sm" />
          <ThemeToggle />
          <UserProfile />
        </div>
      </div>
    </header>
  );
};

export default Header;
