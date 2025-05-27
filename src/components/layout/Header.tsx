
import React from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import UserProfile from './UserProfile';
import LanguageSwitcher from './LanguageSwitcher';
import NavigationMenu from './NavigationMenu';
import ThemeToggle from '@/components/ThemeToggle';

interface HeaderProps {
  onSidebarToggle?: () => void;
  isSidebarOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onSidebarToggle, isSidebarOpen }) => {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur w-full">
      <div className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 lg:px-6 w-full">
        <div className="flex items-center min-w-0 flex-1">
          {/* Mobile sidebar toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 lg:hidden flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10"
            onClick={onSidebarToggle}
          >
            {isSidebarOpen ? (
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
            <span className="sr-only">
              {isSidebarOpen ? 'Menyunu bağla' : 'Menyunu aç'}
            </span>
          </Button>
          
          {/* Desktop navigation - hide on mobile to avoid duplication */}
          <div className="hidden lg:block min-w-0 flex-1">
            <NavigationMenu isSidebarOpen={isSidebarOpen} onMenuClick={onSidebarToggle} />
          </div>

          {/* Mobile: Show logo/title when sidebar is closed */}
          <div className="flex lg:hidden items-center">
            <span className="font-semibold text-sm sm:text-base text-primary">
              InfoLine
            </span>
          </div>
        </div>
        
        {/* Right side controls - responsive sizing */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <ThemeToggle />
          <UserProfile />
        </div>
      </div>
    </header>
  );
};

export default Header;
