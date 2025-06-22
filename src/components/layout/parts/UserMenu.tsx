import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { LogOut, User, Settings, ChevronDown, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/contexts/TranslationContext';
import { usePermissions } from '@/hooks/auth/usePermissions';

const UserMenu: React.FC = () => {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const signOut = useAuthStore((state) => state.signOut);
  const { userRole } = usePermissions();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = useCallback(async () => {
    if (isSigningOut) return;
    
    try {
      setIsSigningOut(true);
      console.log('[UserMenu] Starting logout process...');
      
      await signOut();
      console.log('[UserMenu] Logout completed successfully');
      
    } catch (error) {
      console.error('[UserMenu] Logout error:', error);
      
      try {
        navigate('/login', { replace: true });
      } catch (navError) {
        console.error('[UserMenu] Navigation error:', navError);
        window.location.replace('/login');
      }
    } finally {
      setTimeout(() => {
        setIsSigningOut(false);
      }, 100);
    }
  }, [signOut, navigate, isSigningOut]);

  const handleSettingsClick = useCallback(() => {
    if (!isSigningOut) {
      navigate('/settings');
    }
  }, [navigate, isSigningOut]);

  const handleProfileClick = useCallback(() => {
    if (!isSigningOut) {
      navigate('/profile');
    }
  }, [navigate, isSigningOut]);

  if (!user) return null;

  const isButtonDisabled = isLoading || isSigningOut;
  const displayName = user.full_name || user.email?.split('@')[0] || 'İstifadəçi';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  // Role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'superadmin': return 'text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400';
      case 'regionadmin': return 'text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400';
      case 'sectoradmin': return 'text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400';
      case 'schooladmin': return 'text-purple-600 bg-purple-50 dark:bg-purple-950 dark:text-purple-400';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-950 dark:text-gray-400';
    }
  };

  // Role display name
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'superadmin': return 'Super Admin';
      case 'regionadmin': return 'Region Admin';
      case 'sectoradmin': return 'Sektor Admin';
      case 'schooladmin': return 'Məktəb Admin';
      default: return role;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-9 w-9 hover:bg-accent touch-manipulation"
          disabled={isButtonDisabled}
        >
          <Avatar className="h-6 w-6">
            <AvatarImage src={user.avatar} alt={displayName} />
            <AvatarFallback className="text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-64" align="end">
        {/* User Info Header */}
        <div className="flex items-center space-x-3 p-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar} alt={displayName} />
            <AvatarFallback>
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-1 min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            <div className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium w-fit ${getRoleBadgeColor(userRole || '')}`}>
              <Shield className="h-3 w-3" />
              {getRoleDisplayName(userRole || '')}
            </div>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Menu Items */}
        <DropdownMenuItem 
          onClick={handleProfileClick}
          disabled={isButtonDisabled}
          className="p-3 focus:bg-accent"
        >
          <User className="mr-3 h-4 w-4" />
          <div>
            <div className="text-sm font-medium">
              {t("profile.title") || "Profil"}
            </div>
            <div className="text-xs text-muted-foreground">
              {t("profile.subtitle") || "Hesab məlumatlarını idarə edin"}
            </div>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={handleSettingsClick}
          disabled={isButtonDisabled}
          className="p-3 focus:bg-accent"
        >
          <Settings className="mr-3 h-4 w-4" />
          <div>
            <div className="text-sm font-medium">
              {t("settings.title") || "Tənzimləmələr"}
            </div>
            <div className="text-xs text-muted-foreground">
              {t("settings.subtitle") || "Sistem parametrləri"}
            </div>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Logout */}
        <DropdownMenuItem 
          onClick={handleSignOut}
          disabled={isButtonDisabled}
          className="p-3 text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
        >
          <LogOut className="mr-3 h-4 w-4" />
          <div>
            <div className="text-sm font-medium">
              {isSigningOut ? (t("auth.signingOut") || 'Çıxış edilir...') : (t("auth.logout.title") || 'Çıxış')}
            </div>
            <div className="text-xs opacity-75">
              {t("auth.logout.subtitle") || "Hesabdan təhlükəsiz çıxış"}
            </div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;