import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { User } from '@/types/user';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface UserDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

const UserDetailsDialog: React.FC<UserDetailsDialogProps> = ({
  open,
  onOpenChange,
  user,
}) => {
  const { t } = useLanguage();

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return t('notAvailable');
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy HH:mm');
    } catch (error) {
      console.error('Invalid date format:', dateStr);
      return t('notAvailable');
    }
  };

  function getStatusBadgeStyle(status: string) {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'blocked':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  }

  const displayName = user.full_name || user.name || '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('userDetails')}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.avatar || ''} alt={displayName} />
            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
              {displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="text-center">
            <h3 className="text-xl font-semibold">{displayName}</h3>
            <p className="text-muted-foreground">{user.email}</p>
            <div className="mt-2">
              <Badge variant="outline" className={user.status && getStatusBadgeStyle(user.status)}>
                {t(user.status || 'active')}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-muted-foreground">{t('role')}</Label>
            <p className="font-medium">{t(String(user.role))}</p>
          </div>
          
          {(user.region_id || user.regionId) && (
            <div>
              <Label className="text-muted-foreground">{t('region')}</Label>
              <p className="font-medium">{user.region_id || user.regionId}</p>
            </div>
          )}
          
          {(user.sector_id || user.sectorId) && (
            <div>
              <Label className="text-muted-foreground">{t('sector')}</Label>
              <p className="font-medium">{user.sector_id || user.sectorId}</p>
            </div>
          )}
          
          {(user.school_id || user.schoolId) && (
            <div>
              <Label className="text-muted-foreground">{t('school')}</Label>
              <p className="font-medium">{user.school_id || user.schoolId}</p>
            </div>
          )}
          
          <div>
            <Label className="text-muted-foreground">{t('lastLogin')}</Label>
            <p className="font-medium">{formatDate(user.lastLogin)}</p>
          </div>
          
          <div>
            <Label className="text-muted-foreground">{t('passwordResetDate')}</Label>
            <p className="font-medium">{formatDate(user.passwordResetDate)}</p>
          </div>
          
          <div>
            <Label className="text-muted-foreground">{t('twoFactorAuth')}</Label>
            <p className="font-medium">{user.twoFactorEnabled ? t('enabled') : t('disabled')}</p>
          </div>
          
          <div>
            <Label className="text-muted-foreground">{t('language')}</Label>
            <p className="font-medium">{user.language || t('notSet')}</p>
          </div>
          
          <div>
            <Label className="text-muted-foreground">{t('createdAt')}</Label>
            <p className="font-medium">{formatDate(user.createdAt)}</p>
          </div>
          
          <div>
            <Label className="text-muted-foreground">{t('updatedAt')}</Label>
            <p className="font-medium">{formatDate(user.updatedAt)}</p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>{t('close')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsDialog;
