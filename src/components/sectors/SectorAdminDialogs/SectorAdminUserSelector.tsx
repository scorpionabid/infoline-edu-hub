
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { FullUserData } from '@/types/supabase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, RefreshCw, UserPlus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SectorAdminUserSelectorProps {
  users: FullUserData[];
  loading: boolean;
  selectedUserId: string;
  onUserSelect: (userId: string) => void;
  onRefresh?: () => void;
}

export const SectorAdminUserSelector: React.FC<SectorAdminUserSelectorProps> = ({
  users,
  loading,
  selectedUserId,
  onUserSelect,
  onRefresh
}) => {
  const { t } = useLanguage();
  
  const handleRefreshClick = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      // Yeniləmə event-i yayımlayaq
      document.dispatchEvent(new Event('refresh-users'));
    }
  };
  
  // İstifadəçi rolunu göstərmək üçün köməkçi funksiya
  const getUserRoleDisplay = (role: string) => {
    switch (role) {
      case 'superadmin':
        return t('superAdmin') || 'Super Admin';
      case 'regionadmin':
        return t('regionAdmin') || 'Region Admin';
      case 'sectoradmin':
        return t('sectorAdmin') || 'Sektor Admin';
      case 'schooladmin':
        return t('schoolAdmin') || 'Məktəb Admin';
      default:
        return t('user') || 'İstifadəçi';
    }
  };
  
  // İstifadəçi məlumatlarını format et (ad, email, rol)
  const formatUserDetails = (user: FullUserData) => {
    const roleName = getUserRoleDisplay(user.role);
    const details = [];
    
    if (user.email) {
      details.push(user.email);
    }
    
    if (roleName) {
      details.push(roleName);
    }
    
    return details.length > 0 ? `(${details.join(' • ')})` : '';
  };
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor="user-select">{t('selectUser') || 'İstifadəçi seçin'}</Label>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRefreshClick}
          disabled={loading}
          className="h-8 px-2"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          <span className="text-xs">{t('refresh') || 'Yenilə'}</span>
        </Button>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-6 border rounded-md border-dashed">
          <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
          <span className="text-sm text-muted-foreground">{t('loading') || 'İstifadəçilər yüklənir...'}</span>
        </div>
      ) : (
        <>
          {users.length === 0 ? (
            <div className="p-6 text-center border rounded-md border-dashed">
              <AlertCircle className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-3">
                {t('noUsersFound') || 'Admin olmayan istifadəçi tapılmadı'}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefreshClick}
                className="mx-auto"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                <span className="text-xs">{t('tryAgain') || 'Təkrar yoxla'}</span>
              </Button>
            </div>
          ) : (
            <Select
              value={selectedUserId}
              onValueChange={onUserSelect}
            >
              <SelectTrigger id="user-select" className="w-full">
                <SelectValue placeholder={t('selectUser') || 'İstifadəçi seçin'} />
              </SelectTrigger>
              <SelectContent>
                <ScrollArea className="h-72">
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id} className="py-2">
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <UserPlus className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="font-medium">{user.full_name || 'İsimsiz İstifadəçi'}</span>
                        </div>
                        <div className="text-xs text-muted-foreground ml-6">
                          {formatUserDetails(user)}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          )}
        </>
      )}
    </div>
  );
};
