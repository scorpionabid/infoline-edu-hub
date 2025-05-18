
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
  BarChart3,
  ClipboardList,
  Columns,
  Building,
  Building2
} from 'lucide-react';
import { useLanguageSafe } from '@/context/LanguageContext';
import { UserRole, normalizeRole } from '@/types/role';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SidebarProps {
  userRole: UserRole | string | null | undefined;
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ userRole: rawUserRole, isOpen, onToggle }) => {
  const { t } = useLanguageSafe();
  
  // Normalize role to handle different type inputs
  const userRole = normalizeRole(rawUserRole);
  
  console.log("[NavigationSidebar] Rendering with raw role:", rawUserRole);
  console.log("[NavigationSidebar] Normalized role:", userRole);
  
  // Improve role checking with boolean flags for better readability
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
      label: t('dashboard') || 'Dashboard', 
      href: '/dashboard', 
      icon: LayoutDashboard,
      visible: true
    },
    { 
      label: t('regions') || 'Regionlar', 
      href: '/regions', 
      icon: Building,
      visible: isSuperAdmin
    },
    { 
      label: t('sectors') || 'Sektorlar', 
      href: '/sectors', 
      icon: Building2,
      visible: isSuperAdmin || isRegionAdmin
    },
    { 
      label: t('schools') || 'Məktəblər', 
      href: '/schools', 
      icon: School,
      visible: isAdmin
    },
    { 
      label: t('categories') || 'Kateqoriyalar', 
      href: '/categories', 
      icon: ClipboardList,
      visible: isAdmin
    },
    { 
      label: t('columns') || 'Sütunlar', 
      href: '/columns', 
      icon: Columns,
      visible: isSuperAdmin || isRegionAdmin
    },
    { 
      label: t('users') || 'İstifadəçilər', 
      href: '/users', 
      icon: Users,
      visible: isAdmin
    },
    { 
      label: t('dataEntry') || 'Məlumatlar', 
      href: '/data-entry', 
      icon: FileText,
      visible: true
    },
    { 
      label: t('approvals') || 'Təsdiqlər', 
      href: '/approvals', 
      icon: CheckSquare,
      visible: isAdmin
    },
    { 
      label: t('settings') || 'Parametrlər', 
      href: '/settings', 
      icon: Settings,
      visible: true
    },
  ];

  // Log the visible navigation items for debugging
  const visibleItems = navItems.filter(item => item.visible);
  console.log("[NavigationSidebar] Visible nav items:", 
    visibleItems.map(item => item.label)
  );

  return (
    <ScrollArea className="h-full py-4">
      <nav className="flex flex-col gap-2 px-2">
        {navItems
          .filter(item => item.visible)
          .map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={isOpen ? onToggle : undefined}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-accent/50 text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/30 hover:text-accent-foreground"
                  )
                }
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
      </nav>
    </ScrollArea>
  );
};

export default Sidebar;
