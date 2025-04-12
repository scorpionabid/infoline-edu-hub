
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguageSafe } from '@/context/LanguageContext';
import { useAuth, useRole } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  FileInput, 
  Users, 
  School, 
  LayoutGrid, 
  Settings, 
  UserCog,
  LogOut,
  Menu,
  ChevronDown,
  MapPin,
  Building,
  FolderKanban,
  Columns
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import NotificationSystem from '@/components/notifications/NotificationSystem';

interface NavigationItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  roles: string[];
}

const NavigationMenu: React.FC<{ isMobile?: boolean }> = ({ isMobile = false }) => {
  const { t } = useLanguageSafe();
  const location = useLocation();
  const { user, logout } = useAuth();
  const isSuperAdmin = useRole('superadmin');
  const isRegionAdmin = useRole('regionadmin');
  const isSectorAdmin = useRole('sectoradmin');
  
  const navigationItems: NavigationItem[] = [
    {
      name: t('dashboard'),
      path: '/dashboard',
      icon: <LayoutGrid className="h-5 w-5" />,
      roles: ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin']
    },
    {
      name: t('regions'),
      path: '/regions',
      icon: <MapPin className="h-5 w-5" />,
      roles: ['superadmin']
    },
    {
      name: t('sectors'),
      path: '/sectors',
      icon: <Building className="h-5 w-5" />,
      roles: ['superadmin', 'regionadmin']
    },
    {
      name: t('schools'),
      path: '/schools',
      icon: <School className="h-5 w-5" />,
      roles: ['superadmin', 'regionadmin', 'sectoradmin']
    },
    {
      name: t('categories'),
      path: '/categories',
      icon: <FolderKanban className="h-5 w-5" />,
      roles: ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin']
    },
    {
      name: t('columns'),
      path: '/columns',
      icon: <Columns className="h-5 w-5" />,
      roles: ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin']
    },
    {
      name: t('users'),
      path: '/users',
      icon: <Users className="h-5 w-5" />,
      roles: ['superadmin', 'regionadmin']
    },
    {
      name: t('dataEntry'),
      path: '/data-entry',
      icon: <FileInput className="h-5 w-5" />,
      roles: ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin']
    },
    {
      name: t('reports'),
      path: '/reports',
      icon: <BarChart3 className="h-5 w-5" />,
      roles: ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin']
    }
  ];
  
  const filteredNavigationItems = navigationItems.filter(item => 
    item.roles.includes(user?.role || '')
  );
  
  const handleLogout = () => {
    logout();
  };
  
  if (isMobile) {
    return (
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user?.name?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="font-medium text-sm">{user?.name}</div>
        </div>
        
        <div className="flex items-center space-x-2">
          <NotificationSystem />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {filteredNavigationItems.map(item => (
                <DropdownMenuItem key={item.path} asChild>
                  <Link 
                    to={item.path} 
                    className={cn(
                      "flex items-center",
                      location.pathname === item.path && "font-semibold"
                    )}
                  >
                    {item.icon}
                    <span className="ml-2">{item.name}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center">
                  <UserCog className="h-5 w-5 mr-2" />
                  {t('profile')}
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="h-5 w-5 mr-2" />
                {t('logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {filteredNavigationItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-3 py-2 text-sm rounded-md font-medium",
                location.pathname === item.path
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="px-2 py-4 border-t">
        <div className="flex items-center justify-between px-3 py-2">
          <NotificationSystem />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="pl-0">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm font-medium">{user?.name}</span>
                  <span className="text-xs text-muted-foreground">{t(user?.role || '')}</span>
                </div>
                <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{t('userMenu')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center cursor-pointer">
                  <UserCog className="h-4 w-4 mr-2" />
                  {t('profile')}
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-red-600 cursor-pointer"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t('logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default NavigationMenu;
