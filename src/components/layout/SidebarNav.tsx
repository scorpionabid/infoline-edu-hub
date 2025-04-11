
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Home, 
  FileInput, 
  PieChart, 
  Users, 
  School, 
  FolderKanban, 
  Settings, 
  MapPin, 
  Building, 
  Columns 
} from 'lucide-react';
import { usePermissions } from '@/hooks/auth/usePermissions';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, label, isActive, onClick }) => (
  <Link
    to={href}
    className={cn(
      "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
      isActive
        ? "bg-primary/10 text-primary font-medium"
        : "text-muted-foreground hover:bg-muted"
    )}
    onClick={onClick}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

const SidebarNav: React.FC<{ onItemClick?: () => void }> = ({ onItemClick }) => {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { userRole } = usePermissions();
  
  // Rol əsasında məlumat idarəetmə icazələrini yoxlayırıq
  const isSuperAdmin = userRole === 'superadmin';
  const isRegionAdmin = userRole === 'regionadmin';
  const isSectorAdmin = userRole === 'sectoradmin';
  const isSchoolAdmin = userRole === 'schooladmin';
  
  // İcazələri müəyyənləşdiririk
  const canManageUsers = isSuperAdmin || isRegionAdmin || isSectorAdmin;
  const canManageSchools = isSuperAdmin || isRegionAdmin || isSectorAdmin;
  const canManageCategories = isSuperAdmin;
  const canManageColumns = isSuperAdmin;
  const canManageRegions = isSuperAdmin;
  const canManageSectors = isSuperAdmin || isRegionAdmin;
  
  const navItems = [
    {
      href: "/dashboard",
      icon: <Home size={20} />,
      label: t('dashboard'),
      show: true
    },
    {
      href: "/regions",
      icon: <MapPin size={20} />,
      label: t('regions'),
      show: canManageRegions
    },
    {
      href: "/sectors",
      icon: <Building size={20} />,
      label: t('sectors'),
      show: canManageSectors
    },
    {
      href: "/schools",
      icon: <School size={20} />,
      label: t('schools'),
      show: canManageSchools
    },
    {
      href: "/categories",
      icon: <FolderKanban size={20} />,
      label: t('categories'),
      show: canManageCategories || isRegionAdmin || isSectorAdmin || isSchoolAdmin
    },
    {
      href: "/columns",
      icon: <Columns size={20} />,
      label: t('columns'),
      show: canManageColumns || isRegionAdmin || isSectorAdmin || isSchoolAdmin
    },
    {
      href: "/users",
      icon: <Users size={20} />,
      label: t('users'),
      show: canManageUsers
    },
    {
      href: "/data-entry",
      icon: <FileInput size={20} />,
      label: t('dataEntry'),
      show: true
    },
    {
      href: "/reports",
      icon: <PieChart size={20} />,
      label: t('reports'),
      show: true
    }
  ];

  return (
    <div className="flex-1 px-3 py-2 space-y-1">
      {navItems
        .filter(item => item.show)
        .map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isActive={pathname === item.href}
            onClick={onItemClick}
          />
        ))}
    </div>
  );
};

export default SidebarNav;
