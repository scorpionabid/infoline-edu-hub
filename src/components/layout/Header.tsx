
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import { ModeToggle } from '@/components/ui/theme-toggle';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLanguage } from '@/context/LanguageContext';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  toggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Adminlik məlumatlarını göstərmək
  const renderAdminInfo = () => {
    if (!user) return null;

    // adminEntity istifadə edərkən null olub-olmadığını yoxlayırıq
    if (user.role === 'schooladmin' && user.adminEntity?.schoolName) {
      return <span className="font-semibold text-lg hidden md:block">{user.adminEntity.schoolName}</span>;
    }
    
    if (user.role === 'sectoradmin' && user.adminEntity?.sectorName) {
      return <span className="font-semibold text-lg hidden md:block">{user.adminEntity.sectorName}</span>;
    }
    
    if (user.role === 'regionadmin' && user.adminEntity?.regionName) {
      return <span className="font-semibold text-lg hidden md:block">{user.adminEntity.regionName}</span>;
    }
    
    if (user.role === 'superadmin') {
      return <span className="font-semibold text-lg hidden md:block">İnfoLine Admin</span>;
    }
    
    return <span className="font-semibold text-lg hidden md:block">{t('dashboard')}</span>;
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="border-b px-4 py-2 h-16 flex items-center justify-between bg-background">
      <div className="flex items-center gap-4">
        {renderAdminInfo()}
      </div>

      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <ModeToggle />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer h-8 w-8">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>{user?.full_name?.charAt(0) || '?'}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem 
              onClick={() => navigate('/profile')}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="material-icons text-sm">person</span>
                <span>{t('profile')}</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => navigate('/settings')}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="material-icons text-sm">settings</span>
                <span>{t('settings')}</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2 text-red-500">
                <span className="material-icons text-sm">logout</span>
                <span>{t('signOut')}</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
