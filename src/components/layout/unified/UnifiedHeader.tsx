import React from "react";
import { Button } from "@/components/ui/button";
import { Menu, Bell, Search, Globe } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import { useMobileClasses } from '@/hooks/layout/mobile';
import { useUserContext } from '@/hooks/auth/useUserContext';
import { ModeToggle } from "@/components/ui/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SearchBar from "../parts/SearchBar";
import NotificationBell from "../parts/NotificationBell";
import UserMenu from "../parts/UserMenu";
import LanguageSwitcher from "../LanguageSwitcher";
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
  const { t, setLanguage } = useTranslation();
  const mobileClasses = useMobileClasses();
  const { displayLines, isLoading } = useUserContext();

  const handleLanguageChange = (langCode: string) => {
    if (setLanguage) {
      setLanguage(langCode as any);
      console.log(`Language changed to: ${langCode}`);
    }
  };

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
          {/* Menu button - bütün ekranlarda */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
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
          
          {/* Desktop title/logo space - User Context */}
          <div className="hidden lg:block min-w-0">
            {isLoading ? (
              <div className="space-y-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-24" />
              </div>
            ) : (
              <div className="min-w-0">
                {displayLines.map((line, index) => (
                  <div 
                    key={index}
                    className={cn(
                      "truncate",
                      index === 0 ? "text-sm font-semibold text-foreground" : "text-xs text-muted-foreground"
                    )}
                    title={line}
                  >
                    {line}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center - Search Bar (responsive width) - icon only search */}
        {showSearch && (
          <div className="flex-1 max-w-sm mx-2 sm:mx-4">
            <form className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder={t("common.search") || "Axtar..."}
                className="w-full bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-9 rounded-md border border-input px-4 py-2 text-sm pl-8 shadow-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-0"
              />
            </form>
          </div>
        )}

        {/* Right side - Actions and User Menu */}
        <div className="flex items-center gap-1 ml-auto">
          {/* Notifications - real NotificationBell component */}
          {showNotifications && (
            <NotificationBell />
          )}

          {/* Theme Toggle */}
          <div className="hidden md:block">
            <ModeToggle />
          </div>

          {/* Language Switcher - icon version with dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Globe className="h-4 w-4" />
                <span className="sr-only">{t("common.language_switcher") || "Dil"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[120px]">
              <DropdownMenuItem onClick={() => handleLanguageChange('az')}>
                <span className="text-lg mr-2">🇦🇿</span>
                Azərbaycanca
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLanguageChange('en')}>
                <span className="text-lg mr-2">🇬🇧</span>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLanguageChange('ru')}>
                <span className="text-lg mr-2">🇷🇺</span>
                Русский
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLanguageChange('tr')}>
                <span className="text-lg mr-2">🇹🇷</span>
                Türkçe
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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