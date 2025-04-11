
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/auth/useAuth';
import {
  Home,
  LayoutGrid,
  Layers,
  School,
  Map,
  UsersRound,
  FileSpreadsheet,
  BarChart3,
  Settings,
  FileInput,
  LogOut,
} from 'lucide-react';

interface SidebarNavProps extends React.HTMLAttributes<HTMLDivElement> {
  onItemClick?: () => void; // Əlavə edilmiş onItemClick prop
}

export function SidebarNav({ className, onItemClick, ...props }: SidebarNavProps) {
  const { t } = useLanguage();
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const userRole = user?.role || 'user';

  const isSchoolAdmin = userRole === 'schooladmin';
  const isSectorAdmin = userRole === 'sectoradmin';
  const isRegionAdmin = userRole === 'regionadmin';
  const isSuperAdmin = userRole === 'superadmin';

  const canManageRegions = isSuperAdmin;
  const canManageSectors = isSuperAdmin || isRegionAdmin;
  const canManageSchools = isSuperAdmin || isRegionAdmin || isSectorAdmin;
  const canManageUsers = isSuperAdmin || isRegionAdmin || isSectorAdmin;

  const items = [
    {
      title: t('dashboard'),
      href: isSchoolAdmin ? '/school-dashboard' : '/dashboard',
      icon: Home,
      visible: true,
    },
    {
      title: t('categories'),
      href: '/categories',
      icon: LayoutGrid,
      visible: !isSchoolAdmin,
    },
    {
      title: t('columns'),
      href: '/columns',
      icon: Layers,
      visible: !isSchoolAdmin,
    },
    {
      title: t('regions'),
      href: '/regions',
      icon: Map,
      visible: canManageRegions,
    },
    {
      title: t('sectors'),
      href: '/sectors',
      icon: Map,
      visible: canManageSectors,
    },
    {
      title: t('schools'),
      href: '/schools',
      icon: School,
      visible: canManageSchools,
    },
    {
      title: t('users'),
      href: '/users',
      icon: UsersRound,
      visible: canManageUsers,
    },
    {
      title: t('dataEntry'),
      href: '/data-entry',
      icon: FileInput,
      visible: isSchoolAdmin,
    },
    {
      title: t('reports'),
      href: '/reports',
      icon: BarChart3,
      visible: true,
    },
    {
      title: t('settings'),
      href: '/settings',
      icon: Settings,
      visible: true,
    },
  ];

  const handleItemClick = () => {
    if (onItemClick) {
      onItemClick();
    }
  };

  return (
    <div className={cn('pb-12', className)} {...props}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-xl font-semibold tracking-tight">
            {t('infoLine')}
          </h2>
          <div className="flex items-center gap-2 px-2">
            <span className="text-xs text-muted-foreground opacity-70">
              {userRole === 'superadmin'
                ? t('superAdmin')
                : userRole === 'regionadmin'
                ? t('regionAdmin')
                : userRole === 'sectoradmin'
                ? t('sectorAdmin')
                : userRole === 'schooladmin'
                ? t('schoolAdmin')
                : t('user')}
            </span>
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-10rem)]">
          <div className="space-y-1 p-2">
            {items
              .filter((item) => item.visible)
              .map((item) => (
                <Link to={item.href} key={item.href} onClick={handleItemClick}>
                  <Button
                    variant={pathname === item.href ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </Button>
                </Link>
              ))}

            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={() => {
                logout();
                if (onItemClick) onItemClick();
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t('logout')}
            </Button>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

export default SidebarNav;

