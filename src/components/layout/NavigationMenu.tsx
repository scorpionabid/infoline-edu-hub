
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth';

interface NavigationMenuProps {
  onMenuClick?: () => void;
  isSidebarOpen?: boolean;
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({ onMenuClick, isSidebarOpen }) => {
  const { t } = useLanguage();
  const location = useLocation();
  const { user } = useAuth();
  const { 
    isSuperAdmin,
    isRegionAdmin,
    isSectorAdmin,
    isSchoolAdmin,
    canManageSchools,
    canManageCategories
  } = usePermissions();

  const activeItem = location.pathname.split('/')[1] || 'dashboard';

  const navigationItems = [
    { id: 'dashboard', label: t('dashboard'), path: '/dashboard', visible: true },
    { id: 'regions', label: t('regions'), path: '/regions', visible: isSuperAdmin },
    { id: 'sectors', label: t('sectors'), path: '/sectors', visible: isSuperAdmin || isRegionAdmin },
    { id: 'schools', label: t('schools'), path: '/schools', visible: canManageSchools },
    { id: 'categories', label: t('categories'), path: '/categories', visible: canManageCategories },
    { id: 'columns', label: t('columns'), path: '/columns', visible: canManageCategories },
    { id: 'users', label: t('users'), path: '/users', visible: isSuperAdmin || isRegionAdmin || isSectorAdmin },
    { id: 'data-entry', label: t('dataEntry'), path: '/data-entry', visible: isSuperAdmin || isSchoolAdmin || isSectorAdmin },
    { id: 'approvals', label: t('approvals'), path: '/approvals', visible: isSuperAdmin || isRegionAdmin || isSectorAdmin },
    { id: 'reports', label: t('reports'), path: '/reports', visible: true },
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
          >
            {item.label}
          </Link>
        ))}

      <div className="md:hidden mt-4">
        <Button variant="outline" size="sm" onClick={() => onMenuClick && onMenuClick()}>
          {isSidebarOpen ? t('closeSidebar') : t('openSidebar')}
        </Button>
      </div>
    </nav>
  );
};

export default NavigationMenu;
