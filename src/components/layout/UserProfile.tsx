
import React from 'react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLanguage } from '@/context/LanguageContext';
import { ChevronDown, LogOut, Settings, User, UserCog } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import { usePermissions } from '@/hooks/auth/usePermissions';

interface UserProfileProps {
  onLogout?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onLogout }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { userRole } = usePermissions();

  const handleLogout = () => {
    logout();
    if (onLogout) onLogout();
  };

  // İstifadəçi rolunu insan oxuya biləcək formata çevirək
  const getRoleLabel = (role: string | undefined) => {
    if (!role) return t('noRole');
    
    const roleMap: Record<string, string> = {
      'superadmin': t('superadmin'),
      'regionadmin': t('regionadmin'),
      'sectoradmin': t('sectoradmin'),
      'schooladmin': t('schooladmin')
    };
    
    return roleMap[role] || role;
  };

  // İstifadəçi avatarı üçün başlıq hərfləri
  const getInitials = () => {
    if (!user?.fullName) return '?';
    
    // İstifadəçi adının ilk hərfini alırıq
    return user.fullName
      .split(' ')
      .map(name => name[0]?.toUpperCase())
      .slice(0, 2)
      .join('');
  };

  return (
    <div className="p-3 border-t">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-full flex items-center justify-between px-2 py-1 hover:bg-accent hover:text-accent-foreground">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} alt={user?.fullName || t('user')} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-left">
                <span className="text-sm font-medium truncate" style={{ maxWidth: '140px' }}>
                  {user?.fullName || t('unknownUser')}
                </span>
                <span className="text-xs text-muted-foreground">{getRoleLabel(userRole)}</span>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            {t('userMenu')}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <Link to="/profile">
            <DropdownMenuItem>
              <User className="h-4 w-4 mr-2" />
              {t('myProfile')}
            </DropdownMenuItem>
          </Link>
          
          <Link to="/settings">
            <DropdownMenuItem>
              <Settings className="h-4 w-4 mr-2" />
              {t('settings')}
            </DropdownMenuItem>
          </Link>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleLogout} className="text-destructive">
            <LogOut className="h-4 w-4 mr-2" />
            {t('logout')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserProfile;
