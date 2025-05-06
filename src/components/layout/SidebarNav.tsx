
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  BarChart, Settings, Users, School, BookOpen, 
  FileText, CheckSquare, Map, Building, LogOut,
  ChevronRight, ChevronLeft, Bell, Home
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/auth';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { useLanguage } from '@/context/LanguageContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsCollapsed } from '@/hooks/useIsCollapsed';

interface NavItemProps {
  icon: React.ReactNode;
  href: string;
  label: string;
  badge?: number;
  isCollapsed?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, href, label, badge, isCollapsed = false }) => {
  const location = useLocation();
  const isActive = location.pathname === href || location.pathname.startsWith(`${href}/`);

  return (
    <NavLink
      to={href}
      className={({ isActive }) =>
        cn(
          'flex items-center py-2 px-3 my-1 rounded-md text-sm transition-colors',
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'hover:bg-accent hover:text-accent-foreground'
        )
      }
    >
      {icon}
      {!isCollapsed && (
        <>
          <span className="ml-3">{label}</span>
          {badge !== undefined && badge > 0 && (
            <Badge className="ml-auto" variant="outline">
              {badge}
            </Badge>
          )}
        </>
      )}
    </NavLink>
  );
};

interface SidebarNavProps {
  onItemClick?: () => void;
  isSidebarOpen?: boolean;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ 
  onItemClick,
  isSidebarOpen 
}) => {
  const { t } = useLanguage();
  const { isCollapsed, toggleCollapse } = useIsCollapsed();
  const { 
    isSuperAdmin, 
    isRegionAdmin, 
    isSectorAdmin, 
    isSchoolAdmin,
    canManageUsers,
    canManageRegions,
    canManageSectors,
    canManageSchools,
    canManageCategories,
    canApproveData,
    canRunReports 
  } = usePermissions();

  const menuItems = [
    {
      icon: <Home className="h-5 w-5" />,
      label: t('dashboard'),
      href: '/',
    },
    ...(canManageRegions ? [{
      icon: <Map className="h-5 w-5" />,
      label: t('regions'),
      href: '/regions',
    }] : []),
    ...(canManageSectors ? [{
      icon: <Building className="h-5 w-5" />,
      label: t('sectors'),
      href: '/sectors',
    }] : []),
    ...(canManageSchools ? [{
      icon: <School className="h-5 w-5" />,
      label: t('schools'),
      href: '/schools',
    }] : []),
    ...(canManageCategories || isSchoolAdmin ? [{
      icon: <BookOpen className="h-5 w-5" />,
      label: t('forms'),
      href: '/forms',
    }] : []),
    ...(canManageUsers ? [{
      icon: <Users className="h-5 w-5" />,
      label: t('users'),
      href: '/users',
    }] : []),
    ...(canApproveData ? [{
      icon: <CheckSquare className="h-5 w-5" />,
      label: t('approvals'),
      href: '/approvals',
    }] : []),
    ...(canRunReports ? [{
      icon: <FileText className="h-5 w-5" />,
      label: t('reports'),
      href: '/reports',
    }] : []),
    {
      icon: <BarChart className="h-5 w-5" />,
      label: t('analytics'),
      href: '/analytics',
    },
    {
      icon: <Bell className="h-5 w-5" />,
      label: t('notifications'),
      href: '/notifications',
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: t('settings'),
      href: '/settings',
    },
  ];

  return (
    <div className={cn('py-2 h-full flex flex-col')}>
      <div className="px-3 mb-2 flex items-center justify-end">
        <Button variant="ghost" size="icon" onClick={toggleCollapse} className="h-8 w-8">
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className={cn("flex flex-col px-2", isCollapsed && 'items-center')}>
          {menuItems.map((item, index) => (
            <NavItem
              key={index}
              icon={item.icon}
              href={item.href}
              label={item.label}
              isCollapsed={isCollapsed}
            />
          ))}
        </div>
      </ScrollArea>

      <div className={cn("mt-auto px-2")}>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full flex items-center justify-start px-3 py-2"
          onClick={() => {
            // Logout işlemini burada yapabilirsiniz
          }}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span className="ml-3">{t('logout')}</span>}
        </Button>
      </div>
    </div>
  );
};

export default SidebarNav;
