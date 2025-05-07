
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  BarChart2, 
  FileText,
  School, 
  Book, 
  ClipboardCheck, 
  Settings,
  LogOut,
  User,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { useAuth } from '@/context/auth';

interface NavigationItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void; 
}

const NavigationItem: React.FC<NavigationItemProps> = ({ 
  href, 
  label, 
  icon, 
  active = false,
  onClick 
}) => {
  return (
    <Link 
      to={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-accent",
        active ? "bg-accent text-accent-foreground" : "text-muted-foreground"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

export const NavigationMenu = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const {
    isSuperAdmin,
    isRegionAdmin,
    isSectorAdmin,
    isSchoolAdmin,
    canManageSchools,
    canManageCategories
  } = usePermissions();
  const auth = useAuth();

  const handleLogout = async () => {
    if (auth.logout) {
      await auth.logout();
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="flex flex-col gap-2 p-2">
      <NavigationItem 
        href="/" 
        label={t('dashboard')} 
        icon={<Home className="h-5 w-5" />}
        active={isActive('/')}
      />
      
      {/* İstifadəçi roluna görə səlahiyyətlər */}
      {canManageCategories && (
        <NavigationItem 
          href="/categories" 
          label={t('categories')} 
          icon={<Book className="h-5 w-5" />}
          active={isActive('/categories')}
        />
      )}
      
      {canManageSchools && (
        <NavigationItem 
          href="/schools" 
          label={t('schools')} 
          icon={<School className="h-5 w-5" />}
          active={isActive('/schools')}
        />
      )}

      {/* İstifadəçi roluna görə görüntülənən menyu elementləri */}
      {(isSuperAdmin || isRegionAdmin) && (
        <>
          <NavigationItem 
            href="/regions" 
            label={t('regions')} 
            icon={<BarChart2 className="h-5 w-5" />}
            active={isActive('/regions')}
          />
          
          <NavigationItem 
            href="/sectors" 
            label={t('sectors')} 
            icon={<BarChart2 className="h-5 w-5" />}
            active={isActive('/sectors')}
          />
          
          <NavigationItem 
            href="/users" 
            label={t('users')} 
            icon={<Users className="h-5 w-5" />}
            active={isActive('/users')}
          />
        </>
      )}
      
      {/* Sektor admin menü elementləri */}
      {isSectorAdmin && (
        <NavigationItem 
          href="/approvals" 
          label={t('approvals')} 
          icon={<ClipboardCheck className="h-5 w-5" />}
          active={isActive('/approvals')}
        />
      )}
      
      {/* Məktəb admin menü elementləri */}
      {isSchoolAdmin && (
        <NavigationItem 
          href="/forms" 
          label={t('forms')} 
          icon={<FileText className="h-5 w-5" />}
          active={isActive('/forms')}
        />
      )}
      
      {/* Ümumi menü elementləri */}
      <NavigationItem 
        href="/profile" 
        label={t('profile')} 
        icon={<User className="h-5 w-5" />}
        active={isActive('/profile')}
      />
      
      <NavigationItem 
        href="/settings" 
        label={t('settings')} 
        icon={<Settings className="h-5 w-5" />}
        active={isActive('/settings')}
      />
      
      {/* Çıxış butonu */}
      <NavigationItem 
        href="#" 
        label={t('logout')} 
        icon={<LogOut className="h-5 w-5" />}
        onClick={handleLogout}
      />
    </div>
  );
};

export default NavigationMenu;
