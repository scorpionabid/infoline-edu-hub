
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from '@/context/auth';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { usePermissions } from '@/hooks/auth/usePermissions';

const UserProfile = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const { currentRole } = usePermissions();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  // Default avatar görseli
  const defaultAvatar = "https://github.com/shadcn.png";
  // Fallback için adın baş hərflərini al
  const initials = user?.full_name ? user.full_name.slice(0, 2).toUpperCase() : 'U';

  return (
    <div className="mt-auto">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-secondary cursor-pointer">
            <Avatar>
              <AvatarImage src={user?.avatar || defaultAvatar} alt={user?.full_name || "User Avatar"} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <p className="text-sm font-medium">{user?.full_name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{t('myAccount')}</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => navigate('/profile')}>{t('profile')}</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>{t('logout')}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <p className="text-xs text-muted-foreground mt-1">
        {t('role')}: {currentRole ? t(currentRole.toLowerCase()) : t('user')}
      </p>
    </div>
  );
};

export default UserProfile;
