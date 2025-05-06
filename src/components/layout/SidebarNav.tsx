
import React from 'react';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  LayoutDashboard,
  FileText,
  Building2,
  Users2,
  FileBarChart,
  Settings,
  Layers,
  MapPin,
  Check,
  ThumbsUp,
  UploadCloud
} from 'lucide-react';
import { useIsCollapsed } from '@/hooks/useIsCollapsed';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { useLanguage } from '@/context/LanguageContext';

// NavItem interfeysi
interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  isCollapsed?: boolean;
  badge?: string | number;
  onClick?: () => void;
}

// NavItem komponenti
const NavItem: React.FC<NavItemProps> = ({
  icon,
  label,
  href,
  active = false,
  isCollapsed = false,
  badge,
  onClick
}) => {
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full justify-start",
            active && "bg-muted",
            isCollapsed && "justify-center px-2"
          )}
          asChild
          onClick={onClick}
        >
          <Link to={href}>
            {icon}
            {!isCollapsed && <span className="ml-2">{label}</span>}
            {!isCollapsed && badge && <span className="ml-auto px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">{badge}</span>}
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right" className={cn(!isCollapsed && "hidden")}>
        <div className="flex items-center gap-4">
          {label}
          {badge && <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">{badge}</span>}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

// SidebarNav props interfeysi 
interface SidebarNavProps {
  pendingApprovals?: number;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ pendingApprovals = 0 }) => {
  const { pathname } = useLocation();
  const { isCollapsed } = useIsCollapsed();
  const { 
    canManageUsers, 
    canManageRegions, 
    canManageSectors, 
    canManageSchools, 
    canManageCategories, 
    canApproveData,
    currentRole
  } = usePermissions();
  const { t } = useLanguage();

  // Rollara əsasən menyu elementlərini hazırlaşdıraq
  const menuItems = React.useMemo(() => {
    const items = [
      { icon: <LayoutDashboard className="h-5 w-5" />, label: t('dashboard'), href: '/' },
      { icon: <FileText className="h-5 w-5" />, label: t('forms'), href: '/forms' }
    ];

    // Təsdiq gözləyən formalar üçün link - yalnız Sektor və Region adminləri üçün
    if (canApproveData && pendingApprovals > 0) {
      items.push({
        icon: <ThumbsUp className="h-5 w-5" />,
        label: t('approvals'),
        href: '/approvals',
        badge: pendingApprovals
      });
    }

    // İdarəetmə bölümü
    if (canManageSchools || canManageUsers || canManageRegions || canManageSectors) {
      if (canManageSchools) {
        items.push({ icon: <Building2 className="h-5 w-5" />, label: t('schools'), href: '/schools' });
      }
      
      if (canManageUsers) {
        items.push({ icon: <Users2 className="h-5 w-5" />, label: t('users'), href: '/users' });
      }
      
      if (canManageSectors) {
        items.push({ icon: <Layers className="h-5 w-5" />, label: t('sectors'), href: '/sectors' });
      }
      
      if (canManageRegions) {
        items.push({ icon: <MapPin className="h-5 w-5" />, label: t('regions'), href: '/regions' });
      }
    }
    
    // Kateqoriya idarəetməsi
    if (canManageCategories) {
      items.push({ icon: <Layers className="h-5 w-5" />, label: t('categories'), href: '/categories' });
    }
    
    // Hesabatlar və ayarlar
    items.push({ icon: <FileBarChart className="h-5 w-5" />, label: t('reports'), href: '/reports' });
    items.push({ icon: <Settings className="h-5 w-5" />, label: t('settings'), href: '/settings' });

    // İmportlar və Eksportlar - sonra əlavə ediləcək
    // if (canManageData) {
    //   items.push({ icon: <UploadCloud className="h-5 w-5" />, label: t('imports'), href: '/imports' });
    // }

    return items;
  }, [t, canManageUsers, canManageRegions, canManageSectors, canManageSchools, canApproveData, canManageCategories, pendingApprovals]);

  return (
    <ScrollArea className={cn("flex-1 px-3", isCollapsed && "px-2")}>
      <div className="space-y-1 py-2">
        {menuItems.map((item, index) => (
          <NavItem
            key={index}
            icon={item.icon}
            label={item.label}
            href={item.href}
            active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
            isCollapsed={isCollapsed}
            badge={item.badge}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

export default SidebarNav;
