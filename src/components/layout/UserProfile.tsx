
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { LogOut, User, Settings } from 'lucide-react';

const UserProfile: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex items-center space-x-4 p-4 border rounded-lg">
      <Avatar className="h-10 w-10">
        <AvatarImage src={user.avatar} alt={user.full_name} />
        <AvatarFallback>
          <User className="h-6 w-6" />
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <p className="text-sm font-medium">{user.full_name}</p>
        <p className="text-xs text-muted-foreground">{user.email}</p>
        <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
      </div>
      
      <div className="flex space-x-2">
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default UserProfile;
