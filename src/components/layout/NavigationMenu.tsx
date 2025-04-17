import React, { useState } from 'react';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, School, Users, FileText, MessageSquare, Settings, LogOut, 
  ChevronDown, Menu, X, Globe, ChevronRight, BarChart, Layers, Folder, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import {
  Sheet, SheetContent, SheetTrigger
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/auth/useAuth';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Collapsible, CollapsibleContent, CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { Language } from '@/types/supabase';

const NavigationMenu: React.FC = () => {
  const { t, setLanguage, currentLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole } = usePermissions();
  
  const [openMobile, setOpenMobile] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  
  const getMenuItems = () => {
    const items = [
      {
        title: t('dashboard'),
        icon: <LayoutDashboard className="h-5 w-5" />,
        link: '/dashboard',
        roles: ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin'],
      },
      {
        title: t('regions'),
        icon: <Globe className="h-5 w-5" />,
        link: '/regions',
        roles: ['superadmin'],
      },
      {
        title: t('sectors'),
        icon: <Layers className="h-5 w-5" />,
        link: '/sectors',
        roles: ['superadmin', 'regionadmin'],
      },
      {
        title: t('schools'),
        icon: <School className="h-5 w-5" />,
        link: '/schools',
        roles: ['superadmin', 'regionadmin', 'sectoradmin'],
      },
      {
        title: t('users'),
        icon: <Users className="h-5 w-5" />,
        link: '/users',
        roles: ['superadmin', 'regionadmin', 'sectoradmin'],
      },
      {
        title: t('dataManagement'),
        icon: <Folder className="h-5 w-5" />,
        submenu: true,
        id: 'data',
        roles: ['superadmin', 'regionadmin'],
        items: [
          {
            title: t('categories'),
            link: '/categories',
            icon: <Layers className="h-4 w-4" />,
          },
          {
            title: t('columns'),
            link: '/columns',
            icon: <Layers className="h-4 w-4" />,
          },
        ],
      },
      {
        title: t('dataEntry'),
        icon: <FileText className="h-5 w-5" />,
        link: '/data-entry',
        roles: ['schooladmin'],
      },
      {
        title: t('reports'),
        icon: <BarChart className="h-5 w-5" />,
        link: '/reports',
        roles: ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin'],
      },
      {
        title: t('templates'),
        icon: <BookOpen className="h-5 w-5" />,
        link: '/templates',
        roles: ['superadmin', 'regionadmin'],
      },
      {
        title: t('settings'),
        icon: <Settings className="h-5 w-5" />,
        link: '/settings',
        roles: ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin'],
      },
    ];

    return items.filter(item => item.roles.includes(userRole || 'user'));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  const menuItems = getMenuItems();

  const mobileMenuButton = (
    <Button 
      variant="ghost" 
      size="icon"
      className="lg:hidden"
      onClick={() => setOpenMobile(!openMobile)}
    >
      <Menu className="h-6 w-6" />
      <span className="sr-only">Open Menu</span>
    </Button>
  );

  const userProfile = (
    <div className="flex items-center gap-2">
      <Avatar className="h-8 w-8">
        <AvatarImage src={user?.avatar || ''} alt={user?.full_name || user?.name || ''} />
        <AvatarFallback className="bg-primary/10 text-primary">
          {user?.full_name ? user.full_name.charAt(0).toUpperCase() : (user?.name ? user.name.charAt(0).toUpperCase() : '?')}
        </AvatarFallback>
      </Avatar>
      <div className="hidden md:block">
        <p className="text-sm font-medium">{user?.full_name || user?.name || user?.email}</p>
        <p className="text-xs text-muted-foreground capitalize">{user?.role || 'user'}</p>
        {user?.school_name && (
          <p className="text-xs text-muted-foreground">{user?.school_name}</p>
        )}
      </div>
    </div>
  );

  const userMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto p-2">
          {userProfile}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user?.full_name || user?.name || ''}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/settings/profile')}>
          {t('profile')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          {t('settings')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full">
            <div className="flex items-center justify-between px-2 py-1.5 text-sm">
              <div className="flex items-center">
                <Globe className="mr-2 h-4 w-4" />
                <span>{t(`language_${currentLanguage}`)}</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleLanguageChange('az' as Language)}>
              {t('language_az')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleLanguageChange('en' as Language)}>
              {t('language_en')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleLanguageChange('ru' as Language)}>
              {t('language_ru')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleLanguageChange('tr' as Language)}>
              {t('language_tr')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500">
          <LogOut className="mr-2 h-4 w-4" />
          {t('logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const desktopMenu = (
    <div className="hidden lg:flex h-full">
      <div className="flex items-center">
        <nav className="flex items-center space-x-1">
          {menuItems.map((item) => (
            item.submenu ? (
              <Collapsible 
                key={item.id}
                open={openSubmenu === item.id}
                onOpenChange={() => setOpenSubmenu(openSubmenu === item.id ? null : item.id)}
                className="relative"
              >
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost"
                    className={cn(
                      "flex items-center justify-between px-4 py-2",
                      openSubmenu === item.id && "bg-primary/10"
                    )}
                  >
                    <div className="flex items-center">
                      {item.icon}
                      <span className="ml-2">{item.title}</span>
                    </div>
                    <ChevronDown
                      className={cn("ml-2 h-4 w-4 transition-transform", 
                        openSubmenu === item.id && "transform rotate-180"
                      )}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="absolute z-10 mt-1 w-56 rounded-md border bg-popover shadow-md">
                  <div className="p-1">
                    {item.items?.map((subItem) => (
                      <NavLink
                        key={subItem.link}
                        to={subItem.link}
                        className={({ isActive }) => cn(
                          "flex items-center px-4 py-2 text-sm rounded-sm hover:bg-accent",
                          isActive && "bg-primary/10 text-primary"
                        )}
                        onClick={() => setOpenSubmenu(null)}
                      >
                        {subItem.icon}
                        <span className="ml-2">{subItem.title}</span>
                      </NavLink>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <NavLink
                key={item.link}
                to={item.link}
                className={({ isActive }) => cn(
                  "flex items-center px-4 py-2 rounded-sm text-sm font-medium",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "hover:bg-muted/30 text-muted-foreground hover:text-foreground"
                )}
              >
                {item.icon}
                <span className="ml-2">{item.title}</span>
              </NavLink>
            )
          ))}
        </nav>
      </div>
    </div>
  );

  const mobileMenu = (
    <Sheet open={openMobile} onOpenChange={setOpenMobile}>
      <SheetTrigger asChild>
        {mobileMenuButton}
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <div className="flex h-16 items-center px-4 border-b">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setOpenMobile(false)}
          >
            <X className="h-6 w-6" />
          </Button>
          <div className="ml-4">
            <h2 className="text-lg font-semibold">InfoLine</h2>
            <p className="text-sm text-muted-foreground capitalize">{userRole}</p>
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <div className="px-2 py-4">
            <div className="mb-4 px-4">
              {userProfile}
            </div>
            <nav className="space-y-1">
              {menuItems.map((item) => (
                item.submenu ? (
                  <Collapsible 
                    key={item.id}
                    open={openSubmenu === item.id}
                    onOpenChange={() => setOpenSubmenu(openSubmenu === item.id ? null : item.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button 
                        variant="ghost"
                        className="w-full flex items-center justify-between px-4 py-2 h-auto"
                      >
                        <div className="flex items-center">
                          {item.icon}
                          <span className="ml-2">{item.title}</span>
                        </div>
                        <ChevronDown
                          className={cn("ml-2 h-4 w-4 transition-transform", 
                            openSubmenu === item.id && "transform rotate-180"
                          )}
                        />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="pt-1 pl-10">
                        {item.items?.map((subItem) => (
                          <NavLink
                            key={subItem.link}
                            to={subItem.link}
                            className={({ isActive }) => cn(
                              "flex items-center px-4 py-2 text-sm rounded-sm",
                              isActive ? "bg-primary/10 text-primary" : "hover:bg-accent"
                            )}
                            onClick={() => setOpenMobile(false)}
                          >
                            {subItem.icon}
                            <span className="ml-2">{subItem.title}</span>
                          </NavLink>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <NavLink
                    key={item.link}
                    to={item.link}
                    className={({ isActive }) => cn(
                      "flex items-center px-4 py-2 text-sm rounded-sm",
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "hover:bg-muted/30 text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => setOpenMobile(false)}
                  >
                    {item.icon}
                    <span className="ml-2">{item.title}</span>
                  </NavLink>
                )
              ))}
            </nav>
            <div className="px-4 mt-6 pt-6 border-t">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => navigate('/settings')}
              >
                <Settings className="mr-2 h-4 w-4" />
                {t('settings')}
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start mt-2" 
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {t('logout')}
              </Button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex items-center">
          <NavLink to="/dashboard" className="flex items-center">
            <span className="font-bold text-xl">InfoLine</span>
          </NavLink>
        </div>

        {desktopMenu}
        {mobileMenu}
        
        <div className="ml-auto flex items-center">
          {userMenu}
        </div>
      </div>
    </header>
  );
};

export default NavigationMenu;
