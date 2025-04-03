// Komponentdən NotificationSystem-i çıxaraq
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/utils/cn";
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useLanguage } from '@/context/LanguageContext';
// SideBarnav tipini import edirik
import { SideBarNavItem } from '@/types/ui';
import { UserRole } from '@/types/supabase';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  Settings,
  User
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { sideBarConfig, sideBarHelp } from '@/config/sidebar';

interface SidebarProps {
  t: (key: string, args?: any) => string;
  role: UserRole | undefined;
  isCollapsed: boolean;
  pathname: string;
  onToggleCollapse: () => void;
  onLinkClick?: () => void;
}

const SidebarNav = ({ className, items, isCollapsed, pathname, onLinkClick }: {
  className?: string;
  items: SideBarNavItem[];
  isCollapsed: boolean;
  pathname: string;
  onLinkClick?: () => void;
}) => {
  return (
    <nav className={cn("flex flex-col space-y-1", className)}>
      {items?.map(
        (item, index) =>
          item.href ? (
            <Link
              key={index}
              to={item.href}
              onClick={onLinkClick}
              className={cn(
                "group flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                pathname === item.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground",
                isCollapsed && "justify-center"
              )}
            >
              <item.icon className="h-4 w-4" />
              {!isCollapsed && <span>{item.title}</span>}
            </Link>
          ) : item.items ? (
            <AccordionNav
              key={index}
              item={item}
              isCollapsed={isCollapsed}
              pathname={pathname}
              onLinkClick={onLinkClick}
            />
          ) : null
      )}
    </nav>
  )
}

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface AccordionNavProps {
  item: {
    title: string
    items: SideBarNavItem[]
  }
  isCollapsed: boolean
  pathname: string
  onLinkClick?: () => void
}

const AccordionNav = ({ item, isCollapsed, pathname, onLinkClick }: AccordionNavProps) => {
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    // Check if any of the child items' href matches the pathname
    const childMatch = item.items.some((child) => child.href === pathname)
    setIsOpen(childMatch)
  }, [pathname, item.items])

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value={item.title}>
        <AccordionTrigger
          className={cn(
            "group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            isOpen
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground",
            isCollapsed && "justify-center"
          )}
        >
          <div className="flex items-center space-x-3">
            {item.icon && <item.icon className="h-4 w-4" />}
            {!isCollapsed && <span>{item.title}</span>}
          </div>
          {!isCollapsed && (isOpen ? <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" /> : <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200" />)}
        </AccordionTrigger>
        <AccordionContent className="space-y-1">
          <nav className="flex flex-col space-y-1">
            {item.items.map((subItem, index) => (
              <Link
                key={index}
                to={subItem.href}
                onClick={onLinkClick}
                className={cn(
                  "group flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                  pathname === subItem.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground",
                  isCollapsed && "justify-center"
                )}
              >
                {subItem.icon && <subItem.icon className="h-4 w-4" />}
                {!isCollapsed && <span>{subItem.title}</span>}
              </Link>
            ))}
          </nav>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

const Sidebar = ({ t, role, isCollapsed, pathname, onToggleCollapse, onLinkClick }: SidebarProps) => {
  const getSidebarItems = (role: UserRole | undefined) => {
    switch (role) {
      case 'superadmin':
        return sideBarConfig.superadmin;
      case 'regionadmin':
        return sideBarConfig.regionadmin;
      case 'sectoradmin':
        return sideBarConfig.sectoradmin;
      case 'schooladmin':
        return sideBarConfig.schooladmin;
      default:
        return sideBarHelp;
    }
  };

  const sidebarItems = getSidebarItems(role);

  return (
    <div className="space-y-4">
      <SidebarNav
        className="mt-4"
        items={sidebarItems}
        isCollapsed={isCollapsed}
        pathname={pathname}
        onLinkClick={onLinkClick}
      />
    </div>
  );
};

interface UserMenuDropdownProps {
  user: any;
  onLogout: () => void;
  t: (key: string, args?: any) => string;
}

const UserMenuDropdown: React.FC<UserMenuDropdownProps> = ({ user, onLogout, t }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar} alt={user?.full_name} />
            <AvatarFallback>{user?.full_name?.slice(0, 2)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium leading-none">{user?.full_name}</span>
            <span className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span>{t('myProfile')}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>{t('settings')}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const SidebarLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = useLocation().pathname;
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [open, setOpen] = React.useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Mobile sidebar triggers */}
      <div className="flex z-50 md:hidden items-center h-16 px-4 border-b bg-background">
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
        <div className="ml-auto flex items-center space-x-4">
          {/* NotificationControl komponenti əvəz edirik */}
          <Button variant="ghost" size="icon">
            <Link to="/settings">
              <Settings className="h-5 w-5" />
            </Link>
          </Button>
          <UserMenuDropdown 
            user={user}
            onLogout={handleLogout}
            t={t}
          />
        </div>
      </div>

      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[240px] sm:w-[270px] p-0">
          <div className="flex flex-col h-full">
            <div className="h-16 flex items-center px-6 font-bold text-xl border-b">
              InfoLine
            </div>
            <ScrollArea className="flex-1">
              <div className="px-4 py-2">
                <Sidebar 
                  t={t}
                  role={user?.role}
                  isCollapsed={false}
                  pathname={pathname}
                  onToggleCollapse={() => {}} // Mobile sidebar has no collapse mode
                  onLinkClick={() => setOpen(false)}
                />
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div 
        className={cn(
          "hidden md:flex flex-col border-r",
          isCollapsed ? "w-[80px]" : "w-[240px]",
          "transition-width duration-300 ease-in-out"
        )}
      >
        <div className={cn(
          "h-16 flex items-center px-6 font-bold text-xl border-b",
          isCollapsed && "justify-center px-0"
        )}>
          {isCollapsed ? "IL" : "InfoLine"}
        </div>
        <div className="flex flex-col h-[calc(100vh-4rem)] justify-between">
          <ScrollArea className="flex-1">
            <div className={cn("py-2", isCollapsed ? "px-2" : "px-4")}>
              <Sidebar 
                t={t}
                role={user?.role}
                isCollapsed={isCollapsed}
                pathname={pathname}
                onToggleCollapse={toggleCollapse}
              />
            </div>
          </ScrollArea>
          
          <div className={cn(
            "flex items-center p-4 border-t",
            isCollapsed && "justify-center p-2"
          )}>
            {isCollapsed ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={toggleCollapse} 
                      variant="ghost" 
                      size="icon"
                      className="h-9 w-9"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{t('expandSidebar')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Button 
                onClick={toggleCollapse} 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('collapseSidebar')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-col flex-1">
        {/* Desktop header */}
        <header className="hidden md:flex h-16 items-center px-6 border-b">
          <div className="ml-auto flex items-center space-x-4">
            <UserMenuDropdown
              user={user}
              onLogout={handleLogout}
              t={t}
            />
          </div>
        </header>

        {/* Əsas məzmun və NotificationSystem-i ayırmaq */}
        <main className="flex flex-col flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
