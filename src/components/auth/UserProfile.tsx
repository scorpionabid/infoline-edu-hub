
import React from 'react';
import { useAuth } from '@/context/auth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!user?.full_name) return 'U';
    return user.full_name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full focus:outline-none">
          <Avatar className="h-8 w-8 cursor-pointer">
            {user?.avatar ? (
              <img src={user.avatar} alt={user?.full_name || 'User'} />
            ) : (
              <AvatarFallback>{getInitials()}</AvatarFallback>
            )}
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="p-2 border-b">
          <p className="font-medium">{user?.full_name || 'User'}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          Parametrlər
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>
          Çıxış
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfile;
