
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/auth';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings, User } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { toast } from 'sonner';

export const UserProfile = () => {
  const { user } = useAuth();
  const logout = useAuthStore(state => state.logout);
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Çıxış uğurla edildi',
      });
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Çıxış zamanı xəta baş verdi',
        variant: 'destructive'
      });
    }
  };
  
  if (!user) return null;
  
  // İstifadəçi adının baş hərflərini almaq
  const initials = user.full_name 
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'U';
  
  // Rol adını əldə etmək
  const getRoleName = () => {
    switch(user.role) {
      case 'superadmin': return t('superadmin');
      case 'regionadmin': return t('regionadmin');
      case 'sectoradmin': return t('sectoradmin');
      case 'schooladmin': return t('schooladmin');
      default: return t('user');
    }
  };
  
  const handleSettings = () => {
    navigate('/settings');
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatar || ''} alt={user.full_name || 'User'} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex flex-col px-3 py-2 space-y-1">
          <p className="text-sm font-medium">{user.full_name || 'User'}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
          <p className="text-xs text-muted-foreground">{getRoleName()}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleProfile} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>{t('profile') || 'Profil'}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSettings} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>{t('settings') || 'Parametrlər'}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleLogout}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('logout') || 'Çıxış'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfile;
