
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
  Building2
} from 'lucide-react';
import { useLanguage } from '@/hooks/useTranslation';
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
  
  console.log("[NavigationSidebar] Rendering with raw role:", rawUserRole);
  console.log("[NavigationSidebar] Normalized role:", userRole);
  console.log("[NavigationSidebar] isOpen:", isOpen);
  
  const isAdmin = ['superadmin', 'regionadmin', 'sectoradmin'].includes(userRole);
  const isSuperAdmin = userRole === 'superadmin';
  const isRegionAdmin = userRole === 'regionadmin';
  const isSectorAdmin = userRole === 'sectoradmin';
  const isSchoolAdmin = userRole === 'schooladmin';
  
  console.log("[NavigationSidebar] Role flags:", { 
    isAdmin, isSuperAdmin, isRegionAdmin, isSectorAdmin, isSchoolAdmin
  });
  
  const navItems = [
    { 
      id: 'dashboard',
      label: t('dashboard') || 'İdarəetmə paneli', 
      href: '/dashboard', 
      icon: LayoutDashboard,
      visible: true
    },
    { 
      id: 'regions',
      label: t('regions') || 'Regionlar', 
      href: '/regions', 
      icon: Building,
      visible: isSuperAdmin
    },
    { 
      id: 'sectors',
      label: t('sectors') || 'Sektorlar', 
      href: '/sectors', 
      icon: Building2,
      visible: isSuperAdmin || isRegionAdmin
    },
    { 
      id: 'schools',
      label: t('schools') || 'Məktəblər', 
      href: '/schools', 
      icon: School,
      visible: isAdmin
    },
    { 
      id: 'categories',
      label: t('categories') || 'Kateqoriyalar', 
      href: '/categories', 
      icon: ClipboardList,
      visible: isAdmin
    },
    { 
      id: 'columns',
      label: t('columns') || 'Sütunlar', 
      href: '/columns', 
      icon: Columns,
      visible: isSuperAdmin || isRegionAdmin
    },
    { 
      id: 'users',
      label: t('users') || 'İstifadəçilər', 
      href: '/users', 
      icon: Users,
      visible: isAdmin
    },
    { 
      id: 'data-entry',
      label: t('dataEntry') || 'Məlumat daxiletmə', 
      href: '/data-entry', 
      icon: FileText,
      visible: true
    },
    { 
      id: 'approvals',
      label: t('approvals') || 'Təsdiqlər', 
      href: '/approvals', 
      icon: CheckSquare,
      visible: isAdmin
    },
    { 
      id: 'settings',
      label: t('settings') || 'Parametrlər', 
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
  
  console.log("[NavigationSidebar] Visible nav items:", 
    visibleItems.map(item => item.label)
  );

  return (
    <ScrollArea className="h-full py-4">
      <nav className="flex flex-col gap-1 px-2">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.href}
              onClick={onToggle}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  "hover:bg-accent/30 hover:text-accent-foreground",
                  isActive
                    ? "bg-accent/50 text-accent-foreground font-medium"
                    : "text-muted-foreground"
                )
              }
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </ScrollArea>
  );
};

export default Sidebar;
