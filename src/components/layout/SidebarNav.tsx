
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/auth';
import { useLanguage } from '@/context/LanguageContext';
import {
  Home,
  BarChart3,
  ListChecks,
  Building,
  GraduationCap,
  BarChart2,
  Users,
  Settings,
  ClipboardList,
  CheckCheck,
  User,
  LogOut,
  BookOpen,
} from 'lucide-react';

interface SidebarNavProps {
  className?: string;
  isCollapsed?: boolean;
}

interface NavItem {
  href: string;
  icon: React.ReactElement;
  label: string;
  show: boolean;
}

export function SidebarNav({ className, isCollapsed = false }: SidebarNavProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { hasSuperAdminAccess, hasRegionAdminAccess, hasSectorAdminAccess, hasSchoolAdminAccess } = usePermissions();

  const isActive = (href: string) => {
    return location.pathname === href || (href !== '/' && location.pathname.startsWith(href));
  };

  const renderNavItem = (item: NavItem) => {
    if (!item.show) {
      return null;
    }

    return (
      <Link
        key={item.href}
        to={item.href}
        className={cn(
          buttonVariants({ variant: 'ghost', size: isCollapsed ? 'icon' : 'default' }),
          isActive(item.href)
            ? 'bg-muted hover:bg-muted'
            : 'hover:bg-transparent hover:underline',
          isCollapsed ? 'justify-center' : 'justify-start',
          'h-10'
        )}
      >
        <div className="flex items-center">
          {React.cloneElement(item.icon, {
            className: cn('h-4 w-4', isCollapsed ? '' : 'mr-2'),
          })}
          {!isCollapsed && <span>{item.label}</span>}
        </div>
      </Link>
    );
  };

  const navItems: NavItem[] = [
    {
      href: '/dashboard',
      icon: <Home />,
      label: t('dashboard'),
      show: true,
    },
    {
      href: '/forms',
      icon: <ClipboardList />,
      label: t('forms'),
      show: hasSchoolAdminAccess || hasSectorAdminAccess,
    },
    {
      href: '/approvals',
      icon: <CheckCheck />,
      label: t('approvals'),
      show: hasSectorAdminAccess || hasRegionAdminAccess,
    },
    {
      href: '/regions',
      icon: <Building />,
      label: t('regions'),
      show: hasSuperAdminAccess,
    },
    {
      href: '/sectors',
      icon: <GraduationCap />,
      label: t('sectors'),
      show: hasSuperAdminAccess || hasRegionAdminAccess,
    },
    {
      href: '/schools',
      icon: <BookOpen />,
      label: t('schools'),
      show: hasSuperAdminAccess || hasRegionAdminAccess || hasSectorAdminAccess,
    },
    {
      href: '/categories',
      icon: <ListChecks />,
      label: t('categories'),
      show: hasSuperAdminAccess || hasRegionAdminAccess,
    },
    {
      href: '/reports',
      icon: <BarChart3 />,
      label: t('reports'),
      show: hasSuperAdminAccess || hasRegionAdminAccess || hasSectorAdminAccess,
    },
    {
      href: '/statistics',
      icon: <BarChart2 />,
      label: t('statistics'),
      show: hasSuperAdminAccess || hasRegionAdminAccess || hasSectorAdminAccess,
    },
    {
      href: '/users',
      icon: <Users />,
      label: t('users'),
      show: hasSuperAdminAccess || hasRegionAdminAccess || hasSectorAdminAccess,
    },
    {
      href: '/settings',
      icon: <Settings />,
      label: t('settings'),
      show: true,
    },
  ];

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  return (
    <div className={cn('flex flex-col', className)}>
      <ScrollArea
        className={cn(
          'flex-1 overflow-y-auto',
          isCollapsed ? 'w-[70px]' : 'w-[200px]'
        )}
      >
        <div className="flex flex-col gap-1 py-2">
          {navItems.filter(item => item.show).map(renderNavItem)}
        </div>
        <Separator className="my-2" />
        <div className="flex flex-col gap-1 py-2">
          <Link
            to="/profile"
            className={cn(
              buttonVariants({ variant: 'ghost', size: isCollapsed ? 'icon' : 'default' }),
              isActive('/profile')
                ? 'bg-muted hover:bg-muted'
                : 'hover:bg-transparent hover:underline',
              isCollapsed ? 'justify-center' : 'justify-start',
              'h-10'
            )}
          >
            <div className="flex items-center">
              <User className={cn('h-4 w-4', isCollapsed ? '' : 'mr-2')} />
              {!isCollapsed && <span>{t('profile')}</span>}
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className={cn(
              buttonVariants({ variant: 'ghost', size: isCollapsed ? 'icon' : 'default' }),
              isCollapsed ? 'justify-center' : 'justify-start',
              'h-10'
            )}
          >
            <div className="flex items-center">
              <LogOut className={cn('h-4 w-4', isCollapsed ? '' : 'mr-2')} />
              {!isCollapsed && <span>{t('logout')}</span>}
            </div>
          </button>
        </div>
      </ScrollArea>
    </div>
  );
}
