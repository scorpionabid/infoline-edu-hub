import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, 
  X, 
  Bell, 
  Search, 
  Home,
  Users,
  BarChart3,
  Calendar,
  BookOpen,
  Settings,
  Globe,
  Moon,
  Sun,
  Monitor
} from "lucide-react";
import UserProfile from './UserProfile';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from '@/components/ThemeToggle';
import { useMobile } from '@/hooks/common/useMobile';
import { useTranslation } from '@/contexts/TranslationContext';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { Input } from '@/components/ui/input';
import { NavLink } from 'react-router-dom';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/components/ui/theme-provider';

interface HeaderProps {
  onSidebarToggle?: () => void;
  isSidebarOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onSidebarToggle, isSidebarOpen }) => {
  const isMobile = useMobile();
  const { t, language, setLanguage } = useTranslation();
  const { userRole } = usePermissions();
  const { theme, setTheme } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Quick access navigation items with icons
  const quickNavItems = [
    {
      id: 'home',
      icon: Home,
      href: '/dashboard',
      tooltip: t('navigation.dashboard'),
      visible: true,
    },
    {
      id: 'schools',
      icon: BookOpen,
      href: '/schools',
      tooltip: t('navigation.schools'),
      visible: ['superadmin', 'regionadmin', 'sectoradmin'].includes(userRole || ''),
    },
    {
      id: 'users',
      icon: Users,
      href: '/users',
      tooltip: t('navigation.users'),
      visible: ['superadmin', 'regionadmin', 'sectoradmin'].includes(userRole || ''),
    },
    {
      id: 'reports',
      icon: BarChart3,
      href: '/reports',
      tooltip: t('navigation.reports'),
      visible: ['superadmin', 'regionadmin', 'sectoradmin'].includes(userRole || ''),
    }
  ].filter(item => item.visible);

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 lg:px-6">
          
          {/* Left Section */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            {/* Mobile Menu Toggle */}
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 hover:bg-accent/50 transition-all duration-200 hover:scale-105"
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
            
            {/* Logo/Brand - Mobile */}
            {isMobile && (
              <div className="flex items-center gap-2 animate-fade-in-left">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80">
                  <span className="text-sm font-bold text-primary-foreground">I</span>
                </div>
                <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  InfoLine
                </span>
              </div>
            )}

            {/* Desktop Search Bar - Minimized */}
            {!isMobile && (
              <div className="relative max-w-xs flex-1">
                <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Axtar..."
                  className="pl-7 h-8 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/50 transition-all duration-200 text-xs"
                />
              </div>
            )}
          </div>

          {/* Center Section - Quick Navigation (Desktop Only) */}
          {!isMobile && (
            <div className="hidden lg:flex items-center gap-1 px-4">
              {quickNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>
                      <NavLink to={item.href}>
                        {({ isActive }) => (
                          <Button
                            variant={isActive ? "default" : "ghost"}
                            size="icon"
                            className={`h-9 w-9 transition-all duration-200 ${isActive ? 'bg-primary shadow-lg' : 'hover:bg-accent/50'}`}
                          >
                            <Icon className="h-4 w-4" />
                          </Button>
                        )}
                      </NavLink>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{item.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-1 flex-shrink-0 animate-fade-in-right">
            {/* Mobile Search */}
            {isMobile && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-accent/50 transition-all duration-200"
                  >
                    <Search className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Axtar</p>
                </TooltipContent>
              </Tooltip>
            )}
            
            {/* Notifications */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-8 w-8 hover:bg-accent/50 transition-all duration-200"
                >
                  <Bell className="h-3 w-3" />
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-[10px] flex items-center justify-center"
                  >
                    3
                  </Badge>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Bildirişlər</p>
              </TooltipContent>
            </Tooltip>
            
            {/* Settings Dropdown (Language + Theme) */}
            <DropdownMenu open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-accent/50 transition-all duration-200"
                >
                  <Settings className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-xs">Tənzimləmələr</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Language Section */}
                <DropdownMenuLabel className="text-xs text-muted-foreground flex items-center gap-2">
                  <Globe className="h-3 w-3" />
                  Dil
                </DropdownMenuLabel>
                <DropdownMenuItem 
                  onClick={() => setLanguage?.('az')}
                  className="text-xs cursor-pointer"
                >
                  {language === 'az' && '✓ '}Azərbaycan
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage?.('en')}
                  className="text-xs cursor-pointer"
                >
                  {language === 'en' && '✓ '}English
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage?.('ru')}
                  className="text-xs cursor-pointer"
                >
                  {language === 'ru' && '✓ '}Русский
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage?.('tr')}
                  className="text-xs cursor-pointer"
                >
                  {language === 'tr' && '✓ '}Türkçe
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {/* Theme Section */}
                <DropdownMenuLabel className="text-xs text-muted-foreground flex items-center gap-2">
                  <Monitor className="h-3 w-3" />
                  Tema
                </DropdownMenuLabel>
                <DropdownMenuItem 
                  onClick={() => setTheme('light')}
                  className="text-xs cursor-pointer flex items-center gap-2"
                >
                  <Sun className="h-3 w-3" />
                  {theme === 'light' && '✓ '}Açıq
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setTheme('dark')}
                  className="text-xs cursor-pointer flex items-center gap-2"
                >
                  <Moon className="h-3 w-3" />
                  {theme === 'dark' && '✓ '}Qaranlıq
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setTheme('system')}
                  className="text-xs cursor-pointer flex items-center gap-2"
                >
                  <Monitor className="h-3 w-3" />
                  {theme === 'system' && '✓ '}Sistem
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <UserProfile />
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
};

export default Header;