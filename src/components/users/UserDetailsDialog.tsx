
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/LanguageContext';
import { FullUserData } from '@/types/user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Phone, Calendar, AtSign, MapPin, User, Shield, Globe, Clock } from 'lucide-react';
import { useAuth } from '@/context/auth';
import { usePermissions } from '@/hooks/auth/usePermissions';

interface UserDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: FullUserData;
  onEditClick?: () => void;
}

const UserDetailsDialog: React.FC<UserDetailsDialogProps> = ({
  isOpen,
  onClose,
  user,
  onEditClick
}) => {
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();
  const { isSuperAdmin, isRegionAdmin } = usePermissions();
  
  const formatDate = (date?: string) => {
    if (!date) return '—';
    try {
      return format(new Date(date), 'PPpp');
    } catch (e) {
      return date;
    }
  };
  
  // İstifadəçi roluna görə badge
  const getRoleBadge = () => {
    if (!user || !user.role) return null;
    
    const role = typeof user.role === 'string' ? user.role : 'user';
    
    switch (role) {
      case 'superadmin':
        return <Badge className="bg-purple-600">{t('superadmin')}</Badge>;
      case 'regionadmin':
        return <Badge className="bg-blue-600">{t('regionadmin')}</Badge>;
      case 'sectoradmin':
        return <Badge className="bg-green-600">{t('sectoradmin')}</Badge>;
      case 'schooladmin':
        return <Badge className="bg-amber-600">{t('schooladmin')}</Badge>;
      default:
        return <Badge>{t('user')}</Badge>;
    }
  };
  
  // İstifadəçi statusuna görə badge
  const getStatusBadge = () => {
    if (!user || !user.status) return null;
    
    switch (user.status) {
      case 'active':
        return <Badge variant="success">{t('active')}</Badge>;
      case 'inactive':
        return <Badge variant="secondary">{t('inactive')}</Badge>;
      case 'blocked':
        return <Badge variant="destructive">{t('blocked')}</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">{t('pending')}</Badge>;
      default:
        return <Badge variant="outline">{user.status}</Badge>;
    }
  };
  
  const canEdit = () => {
    if (isSuperAdmin) return true;
    if (isRegionAdmin && user.region_id === currentUser?.region_id) return true;
    return false;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>{t('userDetails')}</span>
            {getRoleBadge()}
            {getStatusBadge()}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* İstifadəçi Profil Kartı */}
          <Card className="md:col-span-1">
            <CardHeader className="text-center">
              <Avatar className="w-24 h-24 mx-auto">
                <AvatarImage src={user.avatar || '/placeholder-user.jpg'} alt={user.full_name} />
                <AvatarFallback>{user.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <CardTitle className="mt-2">{user.full_name || 'İstifadəçi'}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{user.email}</span>
              </div>
              
              {user.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{user.phone}</span>
                </div>
              )}
              
              {user.position && (
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{user.position}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{formatDate(user.created_at || user.createdAt)}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  {user.last_login || user.lastLogin ? formatDate(user.last_login || user.lastLogin) : t('neverLoggedIn')}
                </span>
              </div>
            </CardContent>
          </Card>
          
          {/* Təfərrüatlar */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>{t('details')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Admin Entity */}
                {user.role !== 'user' && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center">
                      <Shield className="w-4 h-4 mr-1" /> {t('adminOf')}
                    </h4>
                    <div className="bg-secondary p-3 rounded-md">
                      {user.role === 'regionadmin' && user.region_id && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{user.adminEntity?.regionName || t('region')}</span>
                        </div>
                      )}
                      
                      {user.role === 'sectoradmin' && user.sector_id && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{user.adminEntity?.sectorName || t('sector')}</span>
                        </div>
                      )}
                      
                      {user.role === 'schooladmin' && user.school_id && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{user.adminEntity?.name || t('school')}</span>
                        </div>
                      )}
                      
                      {!user.region_id && !user.sector_id && !user.school_id && (
                        <div className="text-muted-foreground text-sm">{t('noEntityAssigned')}</div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Dil Tərcihləri */}
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center">
                    <Globe className="w-4 h-4 mr-1" /> {t('preferences')}
                  </h4>
                  <div className="bg-secondary p-3 rounded-md">
                    <div className="flex items-center space-x-2">
                      <span className="text-muted-foreground">{t('language')}:</span>
                      <span>{t(user.language || 'az')}</span>
                    </div>
                  </div>
                </div>
                
                {/* Bildiriş Tərcihləri */}
                <div className="space-y-2 md:col-span-2">
                  <h4 className="font-medium flex items-center">
                    <AtSign className="w-4 h-4 mr-1" /> {t('notificationPreferences')}
                  </h4>
                  <div className="bg-secondary p-3 rounded-md">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {user.notificationSettings?.email && (
                        <Badge variant="outline" className="justify-center">{t('email')}</Badge>
                      )}
                      {user.notificationSettings?.inApp && (
                        <Badge variant="outline" className="justify-center">{t('inApp')}</Badge>
                      )}
                      {user.notificationSettings?.push && (
                        <Badge variant="outline" className="justify-center">{t('push')}</Badge>
                      )}
                      {user.notificationSettings?.deadline && (
                        <Badge variant="outline" className="justify-center">{t('deadlines')}</Badge>
                      )}
                      {user.notificationSettings?.system && (
                        <Badge variant="outline" className="justify-center">{t('system')}</Badge>
                      )}
                      {!user.notificationSettings && (
                        <div className="col-span-full text-muted-foreground text-sm">{t('noNotificationPreferences')}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('close')}
          </Button>
          {canEdit() && onEditClick && (
            <Button onClick={onEditClick}>
              {t('edit')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsDialog;
