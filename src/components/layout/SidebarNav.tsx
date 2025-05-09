
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePermissions } from '@/hooks/auth';
import { useLanguageSafe } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/hooks/auth';
import {
  BarChart2,
  FileText,
  Settings,
  Users,
  MapPin,
  Network,
  School,
  Layout,
  Columns,
  CheckSquare,
  ClipboardList
} from 'lucide-react';

interface SidebarNavProps {
  onMenuClick: () => void;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ onMenuClick }) => {
  const location = useLocation();
  const { t } = useLanguageSafe();
  const { userRole } = usePermissions();
  const { user } = useAuthStore();
  
  console.log("SidebarNav rendering with user role:", userRole);
  console.log("Current user object:", user);

  const activeItem = location.pathname.split('/')[1] || 'dashboard';

  // Define navigation items with proper checks
  const navItems = [
    {
      id: 'dashboard',
      label: t('dashboard'),
      icon: <Layout className="h-4 w-4 mr-2" />,
      path: '/dashboard',
      visible: true
    },
    {
      id: 'regions',
      label: t('regions'),
      icon: <MapPin className="h-4 w-4 mr-2" />,
      path: '/regions',
      visible: userRole === 'superadmin'
    },
    {
      id: 'sectors',
      label: t('sectors'),
      icon: <Network className="h-4 w-4 mr-2" />,
      path: '/sectors',
      visible: userRole === 'superadmin' || userRole === 'regionadmin'
    },
    {
      id: 'schools',
      label: t('schools'),
      icon: <School className="h-4 w-4 mr-2" />,
      path: '/schools',
      visible: ['superadmin', 'regionadmin', 'sectoradmin'].includes(userRole as string)
    },
    {
      id: 'categories',
      label: t('categories'),
      icon: <ClipboardList className="h-4 w-4 mr-2" />,
      path: '/categories',
      visible: ['superadmin', 'regionadmin', 'sectoradmin'].includes(userRole as string)
    },
    {
      id: 'columns',
      label: t('columns'),
      icon: <Columns className="h-4 w-4 mr-2" />,
      path: '/columns',
      visible: ['superadmin', 'regionadmin'].includes(userRole as string)
    },
    {
      id: 'data-entry',
      label: t('dataEntry'),
      icon: <FileText className="h-4 w-4 mr-2" />,
      path: '/data-entry',
      visible: ['superadmin', 'sectoradmin', 'schooladmin'].includes(userRole as string)
    },
    {
      id: 'approvals',
      label: t('approvals'),
      icon: <CheckSquare className="h-4 w-4 mr-2" />,
      path: '/approvals',
      visible: ['superadmin', 'regionadmin', 'sectoradmin'].includes(userRole as string)
    },
    {
      id: 'reports',
      label: t('reports'),
      icon: <BarChart2 className="h-4 w-4 mr-2" />,
      path: '/reports',
      visible: true
    },
    {
      id: 'users',
      label: t('users'),
      icon: <Users className="h-4 w-4 mr-2" />,
      path: '/users',
      visible: ['superadmin', 'regionadmin', 'sectoradmin'].includes(userRole as string)
    },
    {
      id: 'settings',
      label: t('settings'),
      icon: <Settings className="h-4 w-4 mr-2" />,
      path: '/settings',
      visible: true
    }
  ];

  return (
    <nav className="space-y-1 px-2">
      {navItems
        .filter(item => item.visible)
        .map(item => (
          <Link
            key={item.id}
            to={item.path}
            onClick={onMenuClick}
            className={cn(
              'flex items-center px-3 py-2 text-sm rounded-md transition-colors',
              activeItem === item.id
                ? 'bg-secondary text-secondary-foreground font-medium'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
    </nav>
  );
};

export default SidebarNav;
