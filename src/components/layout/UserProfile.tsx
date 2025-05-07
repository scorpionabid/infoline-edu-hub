
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

export const UserProfile = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    if (logout) {
      await logout();
      navigate('/login');
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
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarImage src={user.avatar} alt={user.full_name || ''} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end">
        <div className="px-2 py-1.5 text-sm">
          <div className="font-medium">{user.full_name}</div>
          <div className="text-xs text-muted-foreground">{getRoleName()}</div>
          <div className="text-xs text-muted-foreground">{user.email}</div>
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => navigate('/profile')}>
          <User className="mr-2 h-4 w-4" />
          {t('profile')}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          {t('settings')}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          {t('logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfile;
