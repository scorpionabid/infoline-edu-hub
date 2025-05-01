
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
  isSidebarOpen?: boolean;
  children?: { href: string; label: string; isActive: boolean }[];
}

const NavItem: React.FC<NavItemProps> = ({ 
  href, 
  icon, 
  label, 
  isActive, 
  onClick, 
  isSidebarOpen = true,
  children
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleClick = () => {
    if (children && children.length > 0) {
      setIsOpen(!isOpen);
    }
    if (onClick) onClick();
  };

  return (
    <div className="mb-1">
      <Link
        to={href}
        className={cn(
          "flex items-center px-3 py-2 rounded-md transition-colors",
          isActive
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:bg-muted"
        )}
        onClick={handleClick}
      >
        <div className="flex items-center">
          {icon}
          {isSidebarOpen && <span className="ml-3">{label}</span>}
        </div>
      </Link>

      {/* Alt menyu */}
      {isSidebarOpen && isOpen && children && children.length > 0 && (
        <div className="ml-8 mt-1 space-y-1">
          {children.map((child, index) => (
            <Link
              key={index}
              to={child.href}
              className={cn(
                "block px-3 py-1 rounded-md transition-colors text-sm",
                child.isActive
                  ? "bg-primary/5 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const SidebarNav: React.FC<{ onItemClick?: () => void, isSidebarOpen?: boolean }> = ({ 
  onItemClick,
  isSidebarOpen = true 
}) => {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { 
    userRole, 
    isSuperAdmin,
    isRegionAdmin,
    isSectorAdmin,
    isSchoolAdmin,
    canRegionAdminManageCategoriesColumns,
    canViewSectorCategories 
  } = usePermissions();
  
  // İcazələri müəyyənləşdiririk
  const canManageUsers = isSuperAdmin || isRegionAdmin || isSectorAdmin;
  const canManageSchools = isSuperAdmin || isRegionAdmin || isSectorAdmin;
  const canManageCategories = isSuperAdmin || isRegionAdmin; 
  const canManageColumns = isSuperAdmin || isRegionAdmin;
  const canManageRegions = isSuperAdmin;
  const canManageSectors = isSuperAdmin || isRegionAdmin;
  const canAccessDataEntry = isSuperAdmin || isSectorAdmin || isSchoolAdmin;
  
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
      show: true,
      children: [
        {
          href: "/columns",
          label: t('columns'),
          isActive: pathname === "/columns"
        }
      ]
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
      show: canAccessDataEntry
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
            isSidebarOpen={isSidebarOpen}
            children={item.children}
          />
        ))}
    </div>
  );
};

export default SidebarNav;
