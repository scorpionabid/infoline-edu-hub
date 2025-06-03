
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

  // Define navigation items with proper visibility checks and unique keys
  const navigationItems = [
    { id: 'dashboard', label: t('dashboard') || 'İdarəetmə paneli', path: '/dashboard', visible: true },
    { id: 'regions', label: t('regions') || 'Regionlar', path: '/regions', visible: userRole === 'superadmin' },
    { id: 'sectors', label: t('sectors') || 'Sektorlar', path: '/sectors', visible: userRole === 'superadmin' || userRole === 'regionadmin' },
    { id: 'schools', label: t('schools') || 'Məktəblər', path: '/schools', visible: ['superadmin', 'regionadmin', 'sectoradmin'].includes(userRole as string) },
    { id: 'categories', label: t('categories') || 'Kateqoriyalar', path: '/categories', visible: ['superadmin', 'regionadmin', 'sectoradmin'].includes(userRole as string) },
    { id: 'columns', label: t('columns') || 'Sütunlar', path: '/columns', visible: ['superadmin', 'regionadmin'].includes(userRole as string) },
    { id: 'users', label: t('users') || 'İstifadəçilər', path: '/users', visible: ['superadmin', 'regionadmin', 'sectoradmin'].includes(userRole as string) },
    { id: 'data-entry', label: t('dataEntry') || 'Məlumat daxiletmə', path: '/data-entry', visible: ['superadmin', 'sectoradmin', 'schooladmin'].includes(userRole as string) },
    { id: 'enhanced-data-entry', label: 'Sektor Admin Panel', path: '/enhanced-data-entry', visible: userRole === 'sectoradmin' },
    { id: 'approvals', label: t('approvals') || 'Təsdiqlər', path: '/approvals', visible: ['superadmin', 'regionadmin', 'sectoradmin'].includes(userRole as string) },
    { id: 'settings', label: t('settings') || 'Parametrlər', path: '/settings', visible: true },
  ];

  // Remove duplicate items by unique id
  const uniqueItems = navigationItems.filter((item, index, self) => 
    index === self.findIndex(i => i.id === item.id)
  );

  return (
    <nav className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 xl:gap-6 overflow-x-auto whitespace-nowrap w-full">
      <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3 xl:gap-4">
        {uniqueItems
          .filter(item => item.visible)
          .map(item => (
            <Link 
              key={item.id}
              to={item.path}
              className={cn(
                "transition-colors text-sm lg:text-base px-2 py-1.5 lg:py-1 rounded-md",
                "text-muted-foreground hover:text-primary focus:text-primary",
                "hover:bg-muted/50 focus:bg-muted/50",
                "min-h-[44px] lg:min-h-auto flex items-center touch-manipulation", // Mobile touch target
                activeItem === item.id && "text-primary font-medium bg-primary/10"
              )}
              onClick={() => onMenuClick && onMenuClick()}
            >
              {item.label}
            </Link>
          ))}
      </div>

      {/* Mobile sidebar toggle info */}
      <div className="lg:hidden mt-2 pt-2 border-t border-border">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onMenuClick && onMenuClick()}
          className="w-full text-sm min-h-[44px] touch-manipulation"
        >
          {isSidebarOpen ? (t('closeSidebar') || 'Menyunu bağla') : (t('openSidebar') || 'Menyunu aç')}
        </Button>
      </div>
    </nav>
  );
};

export default NavigationMenu;
