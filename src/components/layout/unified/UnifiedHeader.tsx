import React from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import { useMobileClasses } from '@/hooks/layout/mobile';
import { ModeToggle } from "@/components/ui/theme-toggle";
import SearchBar from "../parts/SearchBar";
import NotificationBell from "../parts/NotificationBell";
import UserMenu from "../parts/UserMenu";
import { cn } from "@/lib/utils";

interface UnifiedHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar?: () => void;
  showSearch?: boolean;
  showNotifications?: boolean;
  customActions?: React.ReactNode;
  height?: number;
}

const UnifiedHeader: React.FC<UnifiedHeaderProps> = ({
  sidebarOpen,
  setSidebarOpen,
  toggleSidebar,
  showSearch = true,
  showNotifications = true,
  customActions,
  height = 64,
}) => {
  const { t } = useTranslation();
  const mobileClasses = useMobileClasses();

  const handleMenuToggle = () => {
    if (toggleSidebar) {
      toggleSidebar();
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  return (
    <header 
      className={cn(
        "sticky top-0 z-30 flex items-center gap-4 border-b",
        "bg-background/95 backdrop-blur-sm",
        "transition-all duration-200"
      )}
      style={{ height }}
    >
      <div className="w-full flex items-center justify-between px-3 md:px-4 lg:px-6 max-w-full h-full">
        {/* Left side - Menu button and branding */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "lg:hidden",
              mobileClasses.touchTarget,
              "hover:bg-accent/50 active:scale-95",
              "transition-all duration-200"
            )}
            onClick={handleMenuToggle}
            aria-label={sidebarOpen ? t('header.closeSidebar') || 'Sidebar-ı bağla' : t('header.openSidebar') || 'Sidebar-ı aç'}
            aria-expanded={sidebarOpen}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {/* Desktop title/logo space */}
          <div className="hidden lg:block">
            <h1 className="text-lg font-semibold text-foreground truncate">
              {t('app.name') || 'InfoLine'}
            </h1>
          </div>
        </div>

        {/* Center - Search Bar (responsive width) */}
        {showSearch && (
          <div className="flex-1 max-w-sm mx-2 sm:mx-4">
            <SearchBar />
          </div>
        )}

        {/* Right side - Actions and User Menu */}
        <div className="flex items-center gap-1 ml-auto">
          {/* Notifications */}
          {showNotifications && (
            <div className="hidden sm:block">
              <NotificationBell />
            </div>
          )}

          {/* Theme Toggle - hidden on mobile to save space */}
          <div className="hidden md:block">
            <ModeToggle />
          </div>

          {/* Custom Actions */}
          {customActions && (
            <div className="hidden sm:flex items-center gap-1">
              {customActions}
            </div>
          )}

          {/* User Menu - always visible but responsive */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default UnifiedHeader;