
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, CheckCircle, User, User2, Users } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/context/LanguageContext';
import { FullUserData } from '@/types/user';

interface UserDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  user: FullUserData | null;
}

const UserDetailsDialog: React.FC<UserDetailsDialogProps> = ({ open, onClose, user }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>İstifadəçi Detalları</DialogTitle>
          <DialogDescription>
            İstifadəçi məlumatlarına baxın və idarə edin.
          </DialogDescription>
        </DialogHeader>
        
        {user ? (
          <UserDetailsSection user={user} />
        ) : (
          <div className="text-center py-8">
            İstifadəçi məlumatları yüklənir...
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsDialog;

const UserDetailsSection = ({ user }: { user: FullUserData }) => {
  const { t } = useLanguage();

  // Type guard to check if entityName is an object
  const isEntityObject = (value: any): value is { region?: string; sector?: string; school?: string } => {
    return value && typeof value === 'object' && !Array.isArray(value);
  };

  return (
    <div className="space-y-6">
      {/* User basic info */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={user.avatar || ''} alt={user.full_name || 'User'} />
            <AvatarFallback>{user.full_name?.charAt(0) || '?'}</AvatarFallback>
          </Avatar>
          <div>
            <div className="text-lg font-semibold">{user.full_name}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>
        
        <div className="flex justify-between py-1 border-b">
          <span className="text-sm text-muted-foreground">{t('role')}</span>
          <span className="text-sm font-medium">{t(user.role || 'user')}</span>
        </div>
        
        <div className="flex justify-between py-1 border-b">
          <span className="text-sm text-muted-foreground">{t('status')}</span>
          <span className="text-sm font-medium">{t(user.status || 'active')}</span>
        </div>
      </div>
      
      {/* User entity info */}
      <div className="space-y-2">
        <div className="text-sm font-medium">{t('userEntityDetails')}</div>
        
        {/* Region */}
        {user.region_id && (
          <div className="flex justify-between py-1 border-b">
            <span className="text-sm text-muted-foreground">{t('region')}</span>
            <span className="text-sm font-medium">
              {user.entityName && isEntityObject(user.entityName) ? user.entityName.region : user.region_id}
            </span>
          </div>
        )}
        
        {/* Sector */}
        {user.sector_id && (
          <div className="flex justify-between py-1 border-b">
            <span className="text-sm text-muted-foreground">{t('sector')}</span>
            <span className="text-sm font-medium">
              {user.entityName && isEntityObject(user.entityName) ? user.entityName.sector : user.sector_id}
            </span>
          </div>
        )}
        
        {/* School */}
        {user.school_id && (
          <div className="flex justify-between py-1 border-b">
            <span className="text-sm text-muted-foreground">{t('school')}</span>
            <span className="text-sm font-medium">
              {user.entityName && isEntityObject(user.entityName) ? user.entityName.school : user.school_id}
            </span>
          </div>
        )}
      </div>
      
      {/* User activity info */}
      <div className="space-y-2">
        <div className="text-sm font-medium">{t('userActivityDetails')}</div>
        
        <div className="flex justify-between py-1 border-b">
          <span className="text-sm text-muted-foreground">{t('lastLogin')}</span>
          <span className="text-sm font-medium">
            {user.last_login ? format(new Date(user.last_login), 'PPP p') : t('never')}
          </span>
        </div>
        
        <div className="flex justify-between py-1 border-b">
          <span className="text-sm text-muted-foreground">{t('createdAt')}</span>
          <span className="text-sm font-medium">
            {user.created_at ? format(new Date(user.created_at), 'PPP') : t('unknown')}
          </span>
        </div>
      </div>
    </div>
  );
};
