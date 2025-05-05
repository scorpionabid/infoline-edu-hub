
import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { 
  ChevronRight,
  Home,
  Building,
  Building2,
  School,
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Layers,
  CheckCircle
} from 'lucide-react';

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  isCollapsed: boolean;
  onClick?: () => void;
}

interface SidebarNavProps {
  isCollapsed: boolean;
  isSidebarOpen: boolean;
  onItemClick?: () => void;
}

const NavItem = ({ href, label, icon, isActive, isCollapsed, onClick }: NavItemProps) => {
  const navigate = useNavigate();
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(href);
    if (onClick) onClick();
  };
  
  return (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      className={cn(
        "w-full justify-start mb-1 text-sm",
        isActive ? "bg-muted" : "hover:bg-muted/50",
        isCollapsed && "justify-center px-1 py-2"
      )}
      onClick={handleClick}
    >
      <div className="flex items-center">
        <div className={cn(isCollapsed ? "mx-auto" : "mr-2")}>{icon}</div>
        {!isCollapsed && <span>{label}</span>}
      </div>
      {isActive && !isCollapsed && (
        <ChevronRight className="ml-auto h-4 w-4" />
      )}
    </Button>
  );
};

export const SidebarNav: React.FC<SidebarNavProps> = ({ 
  isCollapsed, 
  isSidebarOpen,
  onItemClick
}) => {
  const location = useLocation();
  const { userRole } = usePermissions();
  const { t } = useLanguage();

  const generateNavItems = useMemo(() => {
    const items = [
      {
        href: '/dashboard',
        label: t('dashboard'),
        icon: <Home className="h-4 w-4" />,
        allowedRoles: ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin']
      }
    ];

    // SuperAdmin və RegionAdmin üçün əlavə menyular
    if (userRole === 'superadmin') {
      items.push(
        {
          href: '/regions',
          label: t('regions'),
          icon: <Building className="h-4 w-4" />,
          allowedRoles: ['superadmin']
        }
      );
    }

    // SuperAdmin və RegionAdmin üçün əlavə menyular
    if (['superadmin', 'regionadmin'].includes(userRole)) {
      items.push(
        {
          href: '/sectors',
          label: t('sectors'),
          icon: <Building2 className="h-4 w-4" />,
          allowedRoles: ['superadmin', 'regionadmin']
        }
      );
    }

    // SuperAdmin, RegionAdmin və SectorAdmin üçün əlavə menyular
    if (['superadmin', 'regionadmin', 'sectoradmin'].includes(userRole)) {
      items.push(
        {
          href: '/schools',
          label: t('schools'),
          icon: <School className="h-4 w-4" />,
          allowedRoles: ['superadmin', 'regionadmin', 'sectoradmin']
        }
      );
    }

    // SuperAdmin və RegionAdmin üçün əlavə menyular
    if (['superadmin', 'regionadmin'].includes(userRole)) {
      items.push(
        {
          href: '/categories',
          label: t('categories'),
          icon: <Layers className="h-4 w-4" />,
          allowedRoles: ['superadmin', 'regionadmin']
        },
        {
          href: '/columns',
          label: t('columns'),
          icon: <LayoutDashboard className="h-4 w-4" />,
          allowedRoles: ['superadmin', 'regionadmin']
        }
      );
    }

    // Yalnız SchoolAdmin üçün məlumat daxil etmə
    if (userRole === 'schooladmin') {
      items.push(
        {
          href: '/data-entry',
          label: t('dataEntry'),
          icon: <FileText className="h-4 w-4" />,
          allowedRoles: ['schooladmin']
        }
      );
    }

    // SuperAdmin, RegionAdmin və SectorAdmin üçün təsdiqlər
    if (['superadmin', 'regionadmin', 'sectoradmin'].includes(userRole)) {
      items.push(
        {
          href: '/approvals',
          label: t('approvals'),
          icon: <CheckCircle className="h-4 w-4" />,
          allowedRoles: ['superadmin', 'regionadmin', 'sectoradmin']
        }
      );
    }

    // SuperAdmin, RegionAdmin və SectorAdmin üçün istifadəçilər
    if (['superadmin', 'regionadmin', 'sectoradmin'].includes(userRole)) {
      items.push(
        {
          href: '/users',
          label: t('users'),
          icon: <Users className="h-4 w-4" />,
          allowedRoles: ['superadmin', 'regionadmin', 'sectoradmin']
        }
      );
    }

    // Bütün rollar üçün hesabatlar
    items.push(
      {
        href: '/reports',
        label: t('reports'),
        icon: <FileText className="h-4 w-4" />,
        allowedRoles: ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin']
      }
    );

    // Bütün rollar üçün parametrlər
    items.push(
      {
        href: '/settings',
        label: t('settings'),
        icon: <Settings className="h-4 w-4" />,
        allowedRoles: ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin']
      }
    );

    return items.filter(item => item.allowedRoles.includes(userRole));
  }, [userRole, t]);

  return (
    <div className={cn("px-2 py-1", isCollapsed ? "items-center" : "")}>
      <div className="space-y-0.5">
        {generateNavItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            isActive={location.pathname === item.href || location.pathname.startsWith(`${item.href}/`)}
            isCollapsed={isCollapsed}
            onClick={onItemClick}
          />
        ))}
      </div>
    </div>
  );
};
