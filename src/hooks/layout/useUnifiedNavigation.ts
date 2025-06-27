import { useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { useTranslation } from '@/contexts/TranslationContext';
import { useLocalStorage } from '@/hooks/common/useLocalStorageHook';
import {
  LayoutDashboard,
  FileText,
  BarChart,
  Users,
  BookOpen,
  Columns,
  MapPin,
  Building2,
  GraduationCap,
  Target,
  PieChart,
  LineChart,
  UserCog,
  ChevronDown,
  Settings as SettingsIcon
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: string | number;
  gradient?: string;
  visible: boolean;
}

interface NavigationGroup {
  id: string;
  title: string;
  items: NavigationItem[];
  chevronIcon: React.ComponentType<any>;
}

interface NavigationConfig {
  primary: NavigationItem[];
  management: NavigationGroup[];
}

export const useUnifiedNavigation = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const {
    userRole,
    isSuperAdmin,
    isRegionAdmin,
    isSectorAdmin,
    isSchoolAdmin,
    canManageRegions,
    canManageSectors,
    canManageSchools,
    canManageCategories,
    canManageColumns,
    canManageUsers,
    canApproveData,
  } = usePermissions();

  // Temp fix - always allow viewing reports
  const canViewReports = true;

  // Open sections state
  const [openSections, setOpenSections] = useLocalStorage('nav-sections', ['organization', 'content']);

  // Toggle section open/close
  const toggleSection = useCallback((sectionId: string) => {
    setOpenSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  }, [setOpenSections]);

  // Check if route is active
  const isActive = useCallback((href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  }, [location.pathname]);

  // Navigation configuration
  const navigationConfig: NavigationConfig = useMemo(() => {
    // Primary navigation (always visible, high priority)
    const primaryNavigation: NavigationItem[] = [
      {
        id: "dashboard",
        label: t("navigation.dashboard") || "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        gradient: "from-blue-500 to-blue-600",
        visible: true
      },
      {
        id: "data-entry",
        label: t("navigation.dataEntry") || "Məlumat Girişi",
        href: "/school-data-entry",
        icon: FileText,
        gradient: "from-teal-500 to-teal-600",
        visible: isSchoolAdmin
      },
      {
        id: "data-management",
        label: t("navigation.dataManagement") || "Data İdarəetməsi",
        href: "/data-management",
        icon: SettingsIcon,
        gradient: "from-emerald-500 to-emerald-600",
        visible: isRegionAdmin || isSectorAdmin
      },
      {
        id: "reports",
        label: t("navigation.reports") || "Hesabatlar",
        href: "/reports",
        icon: BarChart,
        gradient: "from-violet-500 to-violet-600",
        visible: canViewReports
      }
    ].filter(item => item.visible);

    // Management navigation groups
    const managementGroups: NavigationGroup[] = [
      // Organization Management
      {
        id: 'organization',
        title: t("navigation.organization") || "Təşkilat",
        chevronIcon: ChevronDown,
        items: [
          {
            id: "regions",
            label: t("navigation.regions") || "Regionlar",
            href: "/regions",
            icon: MapPin,
            gradient: "from-purple-500 to-purple-600",
            visible: canManageRegions
          },
          {
            id: "sectors",
            label: t("navigation.sectors") || "Sektorlar",
            href: "/sectors",
            icon: Building2,
            gradient: "from-indigo-500 to-indigo-600",
            visible: canManageSectors
          },
          {
            id: "schools",
            label: t("navigation.schools") || "Məktəblər",
            href: "/schools",
            icon: GraduationCap,
            gradient: "from-green-500 to-green-600",
            visible: canManageSchools
          }
        ].filter(item => item.visible)
      },

      // Content Management
      {
        id: 'content',
        title: t("navigation.content") || "Məzmun",
        chevronIcon: ChevronDown,
        items: [
          {
            id: "categories",
            label: t("navigation.categories") || "Kateqoriyalar",
            href: "/categories",
            icon: BookOpen,
            gradient: "from-orange-500 to-orange-600",
            visible: canManageCategories
          },
          {
            id: "columns",
            label: t("navigation.columns") || "Sütunlar",
            href: "/columns",
            icon: Columns,
            gradient: "from-pink-500 to-pink-600",
            visible: canManageColumns
          }
        ].filter(item => item.visible)
      },

      // Analytics & Reports
      {
        id: 'analytics',
        title: t("navigation.analytics") || "Analitika",
        chevronIcon: ChevronDown,
        items: [
          {
            id: "statistics",
            label: t("navigation.statistics") || "Statistika",
            href: "/statistics",
            icon: PieChart,
            gradient: "from-rose-500 to-rose-600",
            visible: isRegionAdmin || isSectorAdmin
          },
          {
            id: "progress",
            label: t("navigation.progress") || "İrəliləyiş",
            href: "/progress",
            icon: Target,
            gradient: "from-emerald-500 to-emerald-600",
            visible: isRegionAdmin || isSectorAdmin
          },
          {
            id: "performance",
            label: t("navigation.performance") || "Performans",
            href: "/performance",
            icon: LineChart,
            gradient: "from-slate-500 to-slate-600",
            visible: isSuperAdmin
          }
        ].filter(item => item.visible)
      },

      // Administration
      {
        id: 'administration',
        title: t("navigation.administration") || "İdarəetmə",
        chevronIcon: ChevronDown,
        items: [
          {
            id: "users",
            label: t("navigation.users") || "İstifadəçilər",
            href: "/users",
            icon: Users,
            gradient: "from-blue-500 to-indigo-600",
            visible: canManageUsers
          },
          {
            id: "user-management",
            label: t("navigation.userManagement") || "İstifadəçi İdarəetməsi",
            href: "/user-management",
            icon: UserCog,
            gradient: "from-gray-500 to-gray-600",
            visible: isSuperAdmin
          }
        ].filter(item => item.visible)
      }
    ].filter(group => group.items.length > 0);

    return {
      primary: primaryNavigation,
      management: managementGroups
    };
  }, [
    t, 
    userRole,
    isSuperAdmin,
    isRegionAdmin, 
    isSectorAdmin,
    isSchoolAdmin,
    canManageRegions,
    canManageSectors,
    canManageSchools,
    canManageCategories,
    canManageColumns,
    canManageUsers,
    canApproveData,
    canViewReports
  ]);

  // Get breadcrumbs for current route
  const breadcrumbs = useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const crumbs: Array<{ label: string; href: string }> = [
      { label: t("navigation.home") || "Ana səhifə", href: "/" }
    ];

    // Find navigation item for current path
    const allItems = [
      ...navigationConfig.primary,
      ...navigationConfig.management.flatMap(group => group.items)
    ];

    pathSegments.forEach((segment, index) => {
      const path = '/' + pathSegments.slice(0, index + 1).join('/');
      const item = allItems.find(item => item.href === path);
      
      if (item) {
        crumbs.push({ label: item.label, href: path });
      }
    });

    return crumbs;
  }, [location.pathname, t]);
  // navigationConfig çıxarıldı çünki o artıq hook daxilində hazırlanır

  return {
    navigationConfig,
    openSections,
    toggleSection,
    isActive,
    breadcrumbs,
    currentRoute: location.pathname
  };
};