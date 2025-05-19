
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavigationMenuProps {
  onMenuClick?: () => void;
  isSidebarOpen?: boolean;
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({ onMenuClick, isSidebarOpen }) => {
  const { t } = useLanguage();
  const location = useLocation();
  const { userRole } = usePermissions();
  
  console.log("NavigationMenu rendering with user role:", userRole);
  console.log("NavigationMenu sidebar open state:", isSidebarOpen);

  const activeItem = location.pathname.split('/')[1] || 'dashboard';

  // Define navigation items with proper visibility checks
  const navigationItems = [
    { id: 'dashboard', label: t('dashboard'), path: '/dashboard', visible: true },
    { id: 'regions', label: t('regions'), path: '/regions', visible: userRole === 'superadmin' },
    { id: 'sectors', label: t('sectors'), path: '/sectors', visible: userRole === 'superadmin' || userRole === 'regionadmin' },
    { id: 'schools', label: t('schools'), path: '/schools', visible: ['superadmin', 'regionadmin', 'sectoradmin'].includes(userRole as string) },
    { id: 'categories', label: t('categories'), path: '/categories', visible: ['superadmin', 'regionadmin', 'sectoradmin'].includes(userRole as string) },
    { id: 'columns', label: t('columns'), path: '/columns', visible: ['superadmin', 'regionadmin'].includes(userRole as string) },
    { id: 'users', label: t('users'), path: '/users', visible: ['superadmin', 'regionadmin', 'sectoradmin'].includes(userRole as string) },
    { id: 'data-entry', label: t('dataEntry'), path: '/data-entry', visible: ['superadmin', 'sectoradmin', 'schooladmin'].includes(userRole as string) },
    { id: 'approvals', label: t('approvals'), path: '/approvals', visible: ['superadmin', 'regionadmin', 'sectoradmin'].includes(userRole as string) },
    { id: 'settings', label: t('settings'), path: '/settings', visible: true },
  ];

  return (
    <nav className="flex flex-col md:flex-row md:items-center gap-6 overflow-x-auto whitespace-nowrap w-full">
      {navigationItems
        .filter(item => item.visible)
        .map(item => (
          <Link 
            key={item.id}
            to={item.path}
            className={cn(
              "transition-colors text-muted-foreground hover:text-primary focus:text-primary",
              activeItem === item.id && "text-primary font-medium"
            )}
            onClick={() => onMenuClick && onMenuClick()}
          >
            {item.label}
          </Link>
        ))}

      <div className="md:hidden mt-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onMenuClick && onMenuClick()}
          className="w-full"
        >
          {isSidebarOpen ? t('closeSidebar') : t('openSidebar')}
        </Button>
      </div>
    </nav>
  );
};

export default NavigationMenu;
