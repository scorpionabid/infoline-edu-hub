
import React, { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  Columns,
  PenSquare,
} from 'lucide-react';

interface SidebarNavProps {
  className?: string;
  isCollapsed?: boolean;
  isSidebarOpen?: boolean;
  onItemClick?: () => void;
}

export function SidebarNav({ className, isCollapsed = false, isSidebarOpen, onItemClick }: SidebarNavProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isSuperAdmin, isRegionAdmin, isSectorAdmin, isSchoolAdmin } = usePermissions();

  const isActive = useCallback((href: string) => {
    if (href === '/dashboard' && location.pathname === '/') {
      return true;
    }
    return location.pathname === href || (href !== '/dashboard' && location.pathname.startsWith(href));
  }, [location.pathname]);

  // Naviqasiya əməliyyatını ayrı bir funksiya kimi təyin edirik
  const handleNavigation = useCallback((href: string) => {
    // Əvvəlcə yoxlayırıq ki, istifadəçi eyni səhifəyə getmir
    if (location.pathname !== href) {
      navigate(href);
      // mobile görünüşdə sidbarı gizlədirik
      if (onItemClick) {
        onItemClick();
      }
    }
  }, [navigate, location.pathname, onItemClick]);

  const handleLinkClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    handleNavigation(href);
  }, [handleNavigation]);

  const handleLogout = useCallback(async () => {
    if (logout) {
      await logout();
      navigate('/login');
    }
  }, [logout, navigate]);

  const renderNavItem = useCallback((item: { href: string; icon: React.ReactElement; label: string; show: boolean }) => {
    if (!item.show) {
      return null;
    }

    return (
      <a
        key={item.href}
        href={item.href}
        onClick={(e) => handleLinkClick(e, item.href)}
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
      </a>
    );
  }, [isCollapsed, isActive, handleLinkClick]);

  const navItems = useMemo(() => [
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
      show: isSchoolAdmin || isSectorAdmin,
    },
    {
      href: '/data-entry',
      icon: <PenSquare />,
      label: t('dataEntry'),
      show: isSchoolAdmin || isSectorAdmin,
    },
    {
      href: '/approvals',
      icon: <CheckCheck />,
      label: t('approvals'),
      show: isSectorAdmin || isRegionAdmin,
    },
    {
      href: '/regions',
      icon: <Building />,
      label: t('regions'),
      show: isSuperAdmin,
    },
    {
      href: '/sectors',
      icon: <GraduationCap />,
      label: t('sectors'),
      show: isSuperAdmin || isRegionAdmin,
    },
    {
      href: '/schools',
      icon: <BookOpen />,
      label: t('schools'),
      show: isSuperAdmin || isRegionAdmin || isSectorAdmin,
    },
    {
      href: '/categories',
      icon: <ListChecks />,
      label: t('categories'),
      show: isSuperAdmin || isRegionAdmin,
    },
    {
      href: '/columns',
      icon: <Columns />,
      label: t('columns'),
      show: isSuperAdmin || isRegionAdmin,
    },
    {
      href: '/reports',
      icon: <BarChart3 />,
      label: t('reports'),
      show: isSuperAdmin || isRegionAdmin || isSectorAdmin,
    },
    {
      href: '/statistics',
      icon: <BarChart2 />,
      label: t('statistics'),
      show: isSuperAdmin || isRegionAdmin || isSectorAdmin,
    },
    {
      href: '/users',
      icon: <Users />,
      label: t('users'),
      show: isSuperAdmin || isRegionAdmin || isSectorAdmin,
    },
    {
      href: '/settings',
      icon: <Settings />,
      label: t('settings'),
      show: true,
    },
  ], [t, isSuperAdmin, isRegionAdmin, isSectorAdmin, isSchoolAdmin]);

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
          <a
            href="/profile"
            className={cn(
              buttonVariants({ variant: 'ghost', size: isCollapsed ? 'icon' : 'default' }),
              isActive('/profile')
                ? 'bg-muted hover:bg-muted'
                : 'hover:bg-transparent hover:underline',
              isCollapsed ? 'justify-center' : 'justify-start',
              'h-10'
            )}
            onClick={(e) => handleLinkClick(e, '/profile')}
          >
            <div className="flex items-center">
              <User className={cn('h-4 w-4', isCollapsed ? '' : 'mr-2')} />
              {!isCollapsed && <span>{t('profile')}</span>}
            </div>
          </a>
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

export default SidebarNav;
