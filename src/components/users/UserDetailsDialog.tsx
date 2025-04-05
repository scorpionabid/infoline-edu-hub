
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Card, 
  CardContent, 
  CardDescription,
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Building2, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  User2,
  BookOpen, 
  School, 
  Briefcase,
  Languages
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { FullUserData } from '@/types/supabase';
import { useLanguage } from '@/context/LanguageContext';

interface UserDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: FullUserData;
}

const UserDetailsDialog: React.FC<UserDetailsDialogProps> = ({ 
  open, 
  onOpenChange, 
  user 
}) => {
  const { t } = useLanguage();

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return t('notAvailable');
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy HH:mm');
    } catch (error) {
      return t('invalidDate');
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-purple-100 text-purple-800';
      case 'regionadmin':
        return 'bg-blue-100 text-blue-800';
      case 'sectoradmin':
        return 'bg-green-100 text-green-800';
      case 'schooladmin':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('userDetails')}</DialogTitle>
          <DialogDescription>{t('viewUserInfoDesc')}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div className="flex flex-col items-center space-y-2">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatar} alt={user.full_name} />
              <AvatarFallback className="text-lg">
                {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Badge variant="outline" className={getRoleBadgeStyle(user.role)}>
              {t(user.role)}
            </Badge>
            <Badge variant="outline" className={getStatusBadgeStyle(user.status)}>
              {t(user.status)}
            </Badge>
          </div>
          
          <div className="flex-1">
            <Card className="border-0 shadow-none">
              <CardHeader className="p-0 pb-2">
                <CardTitle className="text-xl">{user.full_name}</CardTitle>
                <CardDescription className="flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  {user.email}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  
                  {user.position && (
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{user.position}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <Languages className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{t(`language_${user.language}`)}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{t('lastLogin')}: {formatDate(user.last_login)}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{t('accountCreated')}: {formatDate(user.created_at)}</span>
                  </div>
                </div>
                
                {/* Admin Entity Information */}
                {user.adminEntity && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h3 className="font-medium">{t('adminEntityDetails')}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center">
                          {user.adminEntity.type === 'region' ? (
                            <Building2 className="h-4 w-4 mr-2 text-blue-600" />
                          ) : user.adminEntity.type === 'sector' ? (
                            <BookOpen className="h-4 w-4 mr-2 text-green-600" />
                          ) : (
                            <School className="h-4 w-4 mr-2 text-orange-600" />
                          )}
                          <span><strong>{t('entityName')}:</strong> {user.adminEntity.name}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <User2 className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span><strong>{t('entityType')}:</strong> {t(user.adminEntity.type)}</span>
                        </div>
                        
                        {user.adminEntity.regionName && user.adminEntity.type !== 'region' && (
                          <div className="flex items-center">
                            <Building2 className="h-4 w-4 mr-2 text-blue-600" />
                            <span><strong>{t('region')}:</strong> {user.adminEntity.regionName}</span>
                          </div>
                        )}
                        
                        {user.adminEntity.sectorName && user.adminEntity.type === 'school' && (
                          <div className="flex items-center">
                            <BookOpen className="h-4 w-4 mr-2 text-green-600" />
                            <span><strong>{t('sector')}:</strong> {user.adminEntity.sectorName}</span>
                          </div>
                        )}
                        
                        {user.adminEntity.schoolType && (
                          <div className="flex items-center">
                            <School className="h-4 w-4 mr-2 text-orange-600" />
                            <span><strong>{t('schoolType')}:</strong> {user.adminEntity.schoolType}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            {t('close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsDialog;
