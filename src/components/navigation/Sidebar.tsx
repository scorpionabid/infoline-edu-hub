
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  School, 
  FileText, 
  CheckSquare, 
  Settings,
  ClipboardList,
  Columns,
  Building,
  Building2,
  Database, // ✅ YENİ: Sektor məlumatları üçün ikon
  TrendingUp, // ✅ YENİ: Statistika üçün ikon
  Activity, // ✅ YENİ: Proqres izləmə və performans üçün ikon
  BarChart3, // ✅ YENİ: Əlavə statistika ikonu
  FileBarChart // ✅ YENİ: Reports üçün ikon
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SidebarProps {
  userRole: string | null | undefined;
  isOpen: boolean;
  onToggle: () => void;
}

const normalizeRole = (role?: string | null): string => {
  if (!role) return 'user';
  
  const normalizedRole = role.toLowerCase().replace(/[_-]/g, '');
  
  if (normalizedRole.includes('super') && normalizedRole.includes('admin')) {
    return 'superadmin';
  }
  if (normalizedRole.includes('region') && normalizedRole.includes('admin')) {
    return 'regionadmin';
  }
  if (normalizedRole.includes('sector') && normalizedRole.includes('admin')) {
    return 'sectoradmin';
  }
  if (normalizedRole.includes('school') && normalizedRole.includes('admin')) {
    return 'schooladmin';
  }
  
  return normalizedRole;
};

const Sidebar: React.FC<SidebarProps> = ({ userRole: rawUserRole, isOpen, onToggle }) => {
  const { t } = useLanguage();
  
  const userRole = normalizeRole(rawUserRole);
  
  const isAdmin = ['superadmin', 'regionadmin', 'sectoradmin'].includes(userRole);
  const isSuperAdmin = userRole === 'superadmin';
  const isRegionAdmin = userRole === 'regionadmin';
  const isSectorAdmin = userRole === 'sectoradmin';
  const isSchoolAdmin = userRole === 'schooladmin';
  
  const navItems = [
    { 
      id: 'dashboard',
      label: t('navigation.dashboard'), 
      href: '/dashboard', 
      icon: LayoutDashboard,
      visible: true
    },
    { 
      id: 'regions',
      label: t('navigation.regions'), 
      href: '/regions', 
      icon: Building,
      visible: isSuperAdmin
    },
    { 
      id: 'sectors',
      label: t('navigation.sectors'), 
      href: '/sectors', 
      icon: Building2,
      visible: isSuperAdmin || isRegionAdmin
    },
    { 
      id: 'schools',
      label: t('navigation.schools'), 
      href: '/schools', 
      icon: School,
      visible: isAdmin
    },
    { 
      id: 'categories',
      label: t('navigation.categories'), 
      href: '/categories', 
      icon: ClipboardList,
      visible: isAdmin
    },
    { 
      id: 'columns',
      label: t('navigation.columns'), 
      href: '/columns', 
      icon: Columns,
      visible: isSuperAdmin || isRegionAdmin
    },
    { 
      id: 'users',
      label: t('navigation.users'), 
      href: '/users', 
      icon: Users,
      visible: isAdmin
    },
    // Sektor məlumatları - yalnız sektor adminləri üçün
    { 
      id: 'sector-data-entry',
      label: t('navigation.sectorDataEntry'), 
      href: '/sector-data-entry', 
      icon: Database,
      visible: isSectorAdmin
    },
    // Statistika - Region və Sektor adminləri üçün
    { 
      id: 'statistics',
      label: t('navigation.statistics'), 
      href: '/statistics', 
      icon: TrendingUp,
      visible: isRegionAdmin || isSectorAdmin
    },
    // Proqres İzləmə - Region və Sektor adminləri üçün
    { 
      id: 'progress',
      label: t('navigation.progress'), 
      href: '/progress', 
      icon: Activity,
      visible: isRegionAdmin || isSectorAdmin
    },
    // Performans - SuperAdmin üçün
    { 
      id: 'performance',
      label: t('navigation.performance'), 
      href: '/performance', 
      icon: BarChart3,
      visible: isSuperAdmin
    },
    // İstifadəçi İdarəetməsi - SuperAdmin üçün
    { 
      id: 'user-management',
      label: t('navigation.userManagement'), 
      href: '/user-management', 
      icon: Users,
      visible: isSuperAdmin
    },
    { 
      id: 'data-entry',
      label: t('navigation.dataEntry'), 
      href: isSchoolAdmin ? '/school-data-entry' : '/data-entry', 
      icon: FileText,
      visible: true
    },
    { 
      id: 'approvals',
      label: t('navigation.approvals'), 
      href: '/approvals', 
      icon: CheckSquare,
      visible: isAdmin
    },
    // Reports mənyusu - adminlər üçün
    { 
      id: 'reports',
      label: t('navigation.reports'), 
      href: '/reports', 
      icon: FileBarChart,
      visible: isAdmin
    },
    { 
      id: 'settings',
      label: t('navigation.settings'), 
      href: '/settings', 
      icon: Settings,
      visible: true
    },
  ];

  // Remove duplicate items by unique id
  const uniqueItems = navItems.filter((item, index, self) => 
    index === self.findIndex(i => i.id === item.id)
  );

  const visibleItems = uniqueItems.filter(item => item.visible);

  return (
    <div className="h-full py-2 sm:py-4">
      <nav className="flex flex-col gap-1 px-2 sm:px-3">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.href}
              onClick={onToggle}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 sm:gap-3 rounded-lg px-2 sm:px-3 py-2 sm:py-2.5 text-sm transition-colors",
                  "hover:bg-accent/30 hover:text-accent-foreground",
                  "min-h-[44px] touch-manipulation", // Ensure minimum touch target size
                  isActive
                    ? "bg-accent/50 text-accent-foreground font-medium"
                    : "text-muted-foreground"
                )
              }
            >
              <Icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="truncate text-xs sm:text-sm">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
