
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { FullUserData } from '@/types/user';
import { Badge } from '@/components/ui/badge';
import { Edit, Mail, Phone, Calendar, UserCircle, Building, MapPin } from 'lucide-react';

export interface UserDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: FullUserData | null;
  onEdit: () => void;
}

const UserDetailsDialog: React.FC<UserDetailsDialogProps> = ({
  open,
  onOpenChange,
  user,
  onEdit,
}) => {
  const { t } = useLanguage();

  if (!user) return null;

  // UserRole tipinin string olmasını təmin edirik
  const getUserRole = () => {
    if (!user.role) return '';
    if (typeof user.role === 'string') return user.role;
    return user.role.role; // UserRole obyektidirsə onun role xüsusiyyətini qaytarırıq
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{t('userDetails')}</DialogTitle>
          <DialogDescription>
            {t('userDetailsDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.full_name}
                  className="h-24 w-24 rounded-full"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserCircle className="h-14 w-14 text-primary" />
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-semibold mb-1">{user.full_name}</h3>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <Badge variant={user.status === 'active' ? 'success' : 'destructive'}>
                  {user.status === 'active' ? t('active') : t('inactive')}
                </Badge>
                <Badge>{getUserRole()}</Badge>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">{t('contactInfo')}</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">{t('assignment')}</h4>
                <div className="space-y-2">
                  {(user.region_id || user.regionId) && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{user.adminEntity?.regionName || t('regionAssigned')}</span>
                    </div>
                  )}
                  {(user.sector_id || user.sectorId) && (
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{user.adminEntity?.sectorName || t('sectorAssigned')}</span>
                    </div>
                  )}
                  {(user.school_id || user.schoolId) && (
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{user.adminEntity?.name || t('schoolAssigned')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">{t('accountInfo')}</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{t('createdAt')}: {new Date(user.created_at || user.createdAt || '').toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{t('lastLogin')}: {user.last_login || user.lastLogin
                      ? new Date(user.last_login || user.lastLogin).toLocaleDateString()
                      : t('never')}
                    </span>
                  </div>
                </div>
              </div>
              
              {user.position && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">{t('position')}</h4>
                  <p>{user.position}</p>
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">{t('preferences')}</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span>{t('language')}: {user.language || 'az'}</span>
                  </div>
                  <div className="flex items-center">
                    <span>{t('notifications')}: {user.notificationSettings?.email ? t('enabled') : t('disabled')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('close')}
          </Button>
          <Button onClick={onEdit} className="flex items-center">
            <Edit className="h-4 w-4 mr-2" />
            {t('edit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsDialog;
