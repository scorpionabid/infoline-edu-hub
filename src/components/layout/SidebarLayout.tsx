
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/utils/cn";
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useLanguage } from '@/context/LanguageContext';
// SideBarNavItem tipini import edirik
import { SideBarNavItem } from '@/types/supabase';
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
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (title: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <nav className={cn("flex flex-col gap-2", className)}>
      {items.map((item, index) => {
        // Detect if the item is active
        const isActive = item.href ? pathname === item.href : false;
        // Detect if this item has children and if any of them is active
        const hasChildren = item.items && item.items.length > 0;
        const isChildrenActive = hasChildren && item.items?.some(child => child.href ? pathname === child.href : false);
        const isOpen = openItems[item.title] || isChildrenActive;

        if (hasChildren) {
          return (
            <div key={`${item.title}-${index}`}>
              <Button
                variant={isChildrenActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-between px-2 mb-1", 
                  isCollapsed ? "h-9 px-2" : "px-2",
                  isChildrenActive && "bg-muted"
                )}
                onClick={() => toggleItem(item.title)}
              >
                <div className="flex items-center">
                  {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                  {!isCollapsed && <span>{item.title}</span>}
                </div>
                {!isCollapsed && (
                  isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                )}
              </Button>
              {isOpen && !isCollapsed && item.items && (
                <div className="ml-4 border-l pl-2 space-y-1">
                  {item.items.map((child, childIndex) => (
                    <Button
                      key={`${child.title}-${childIndex}`}
                      variant={pathname === child.href ? "secondary" : "ghost"}
                      size="sm"
                      asChild
                      className={cn(
                        "w-full justify-start",
                        pathname === child.href ? "bg-muted" : "transparent"
                      )}
                      onClick={onLinkClick}
                    >
                      <Link to={child.href || '#'}>
                        {child.icon && <child.icon className="mr-2 h-3.5 w-3.5" />}
                        <span>{child.title}</span>
                      </Link>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          );
        }

        return (
          <TooltipProvider key={`${item.title}-${index}`} delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size={isCollapsed ? "icon" : "default"}
                  asChild
                  className={cn(
                    "w-full justify-start",
                    isCollapsed ? "h-9 px-2" : "px-2",
                    isActive && "bg-muted"
                  )}
                  onClick={onLinkClick}
                >
                  <Link to={item.href || '#'}>
                    {item.icon && <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />}
                    {!isCollapsed && <span>{item.title}</span>}
                  </Link>
                </Button>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" className="flex items-center gap-4">
                  {item.title}
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </nav>
  );
};

export const Sidebar = ({ t, role, isCollapsed, pathname, onToggleCollapse, onLinkClick }: SidebarProps) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  // Get the sidebar items based on the user's role
  const sidebarItems = sideBarConfig.find(config => config.role === (role || 'user'))?.items || [];
  // Get the help item that's common for all roles
  const helpItem = sideBarHelp;

  const handleLogout = () => {
    logout();
  };

  // Close mobile sidebar when route changes
  React.useEffect(() => {
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  }, [location, isMobileOpen]);

  // Handle content based on viewport
  const sidebarContent = (
    <div className={cn(
      "flex flex-col h-full",
      isCollapsed ? "w-[60px]" : "w-[240px]"
    )}>
      {/* Sidebar Header */}
      <div className={cn(
        "flex h-14 items-center px-4 py-2",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {!isCollapsed && (
          <span className="text-lg font-semibold">InfoLine</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className={cn(
            "h-7 w-7",
            isCollapsed ? "rotate-180" : ""
          )}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Sidebar Content */}
      <ScrollArea className="flex-1">
        <div className={cn(
          "flex flex-col gap-6 p-2",
          isCollapsed ? "items-center" : "items-start"
        )}>
          <SidebarNav
            items={sidebarItems}
            isCollapsed={isCollapsed}
            pathname={pathname}
            onLinkClick={onLinkClick}
          />
            
          {/* Divider */}
          <div className={cn(
            "h-px bg-muted",
            isCollapsed ? "w-4" : "w-full"
          )} />

          {/* Help section */}
          <SidebarNav
            items={[helpItem]}
            isCollapsed={isCollapsed}
            pathname={pathname}
            onLinkClick={onLinkClick}
          />
        </div>
      </ScrollArea>

      {/* User Section */}
      <div className={cn(
        "p-2 border-t",
        isCollapsed ? "flex justify-center" : ""
      )}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full flex items-center gap-2 p-2",
                isCollapsed ? "justify-center" : "justify-start"
              )}
            >
              <Avatar className="h-7 w-7">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="text-xs">
                  {user?.full_name?.split(' ').map(name => name[0]).join('') || user?.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex flex-col text-left overflow-hidden">
                  <span className="text-sm truncate font-medium">{user?.full_name || user?.email || t('user')}</span>
                  <span className="text-xs text-muted-foreground truncate">
                    {t(user?.role || 'user')}
                  </span>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              {t('myAccount')}
            </DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link to="/profile">
                <User className="mr-2 h-4 w-4" />
                {t('profile')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings">
                <Settings className="mr-2 h-4 w-4" />
                {t('settings')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              {t('logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  // Render based on viewport
  return (
    <>
      {isMobile ? (
        <>
          <Button
            variant="outline"
            size="sm"
            className="md:hidden fixed top-4 left-4 z-40"
            onClick={() => setIsMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetContent side="left" className="p-0">
              {sidebarContent}
            </SheetContent>
          </Sheet>
        </>
      ) : (
        <div className={cn(
          "hidden md:block border-r bg-background transition-width duration-300 ease-in-out overflow-hidden h-screen sticky top-0",
          isCollapsed ? "w-[60px]" : "w-[240px]"
        )}>
          {sidebarContent}
        </div>
      )}
    </>
  );
};

