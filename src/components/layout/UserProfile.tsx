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
import { LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserProfile: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const signOut = useAuthStore((state) => state.signOut);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = useCallback(async () => {
    if (isSigningOut) {
      console.log('[UserProfile] Sign out already in progress, ignoring...');
      return; // Duplicate calls protection
    }
    
    try {
      setIsSigningOut(true);
      console.log('[UserProfile] Starting logout process...');
      
      // FIXED: Await signOut tam bitsin
      await signOut();
      
      console.log('[UserProfile] Logout completed successfully');
      
      // FIXED: No need for manual navigation, authStore handles it
      // signOut funksiyası artıq redirect edir, əlavə navigate lazım deyil
      
    } catch (error) {
      console.error('[UserProfile] Logout error:', error);
      
      // FIXED: Xəta halında manual redirect
      try {
        navigate('/login', { replace: true });
      } catch (navError) {
        console.error('[UserProfile] Navigation error:', navError);
        // Force navigation as last resort
        window.location.replace('/login');
      }
    } finally {
      // FIXED: Reset state yalnız component mount olduqda
      // setTimeout istifadə et ki, component unmount olmazdan əvvəl
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex items-center space-x-2 px-2 hover:bg-accent"
          disabled={isButtonDisabled}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} alt={user.full_name} />
            <AvatarFallback className="text-xs">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-medium truncate max-w-[120px]">
              {user.full_name || user.email?.split('@')[0]}
            </span>
            <span className="text-xs text-muted-foreground capitalize">
              {user.role}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-56" align="end">
        <div className="flex items-center space-x-2 p-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} alt={user.full_name} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user.full_name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleProfileClick}
          disabled={isButtonDisabled}
        >
          <User className="mr-2 h-4 w-4" />
          // Profil
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={handleSettingsClick}
          disabled={isButtonDisabled}
        >
          <Settings className="mr-2 h-4 w-4" />
          Tənzimləmələr
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleSignOut}
          disabled={isButtonDisabled}
          className="text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isSigningOut ? 'Çıxış edilir...' : 'Çıxış'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfile;