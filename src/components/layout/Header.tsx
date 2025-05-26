
import React from 'react';
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
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
      <div className="flex h-16 items-center justify-between px-3 md:px-4 w-full">
        <div className="flex items-center min-w-0 flex-1">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 md:hidden flex-shrink-0"
            onClick={onSidebarToggle}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menyunu aç</span>
          </Button>
          
          {/* Hide navigation menu on mobile to avoid duplication */}
          <div className="hidden md:block min-w-0 flex-1">
            <NavigationMenu isSidebarOpen={isSidebarOpen} onMenuClick={onSidebarToggle} />
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          <LanguageSwitcher />
          <ThemeToggle />
          <UserProfile />
        </div>
      </div>
    </header>
  );
};

export default Header;
