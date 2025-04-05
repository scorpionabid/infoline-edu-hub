
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Region, FullUserData } from '@/types/supabase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAssignExistingUserAsAdmin } from '@/hooks/useAssignExistingUserAsAdmin';
import { useAvailableUsers } from '@/hooks/useAvailableUsers';
import { AlertCircle, Loader2, UserCheck, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ExistingUserAdminDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  region: Region | null;
  onSuccess?: () => void;
}

export const ExistingUserAdminDialog: React.FC<ExistingUserAdminDialogProps> = ({ 
  open, 
  setOpen, 
  region,
  onSuccess
}) => {
  const { t } = useLanguage();
  const { assignUserAsRegionAdmin, loading: assignLoading } = useAssignExistingUserAsAdmin();
  const { users, loading: usersLoading, error: usersError, fetchAvailableUsers } = useAvailableUsers();
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  // Dialog açıldığında istifadəçiləri yenidən əldə et
  useEffect(() => {
    if (open) {
      fetchAvailableUsers();
      setSelectedUserId('');
      setError(null);
    }
  }, [open, fetchAvailableUsers]);
  
  // İstifadəçi seçimi dəyişdikdə
  const handleUserChange = (value: string) => {
    setSelectedUserId(value);
    setError(null);
  };
  
  // Admin təyin etmə prosesi
  const handleAssignAdmin = async () => {
    if (!selectedUserId) {
      setError(t('selectUserRequired') || 'Zəhmət olmasa istifadəçi seçin');
      return;
    }
    
    if (!region) {
      setError(t('regionNotFound') || 'Region tapılmadı');
      return;
    }

    console.log('Təyin edilmə başladı. Region ID:', region.id, 'User ID:', selectedUserId);
    
    try {
      const result = await assignUserAsRegionAdmin(region.id, selectedUserId);
      
      if (result.success) {
        console.log('Təyin etmə uğurla başa çatdı', result);
        setOpen(false);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        console.error('Təyin etmə xətası:', result.error);
        setError(result.error);
      }
    } catch (err: any) {
      console.error('Təyin etmə zamanı istisna:', err);
      setError(err.message || t('errorAssigningAdmin') || 'Admin təyin edilərkən xəta baş verdi');
    }
  };

  // İstifadəçiləri filtrlə - SuperAdminləri çıxar və region adminlərini əvvələ gətir
  const filteredUsers = React.useMemo(() => {
    return users
      .filter(user => user.role !== 'superadmin') // SuperAdminləri çıxar
      .sort((a, b) => {
        // Regionadminləri əvvələ gətir
        if (a.role === 'regionadmin' && b.role !== 'regionadmin') return -1;
        if (a.role !== 'regionadmin' && b.role === 'regionadmin') return 1;
        return a.name.localeCompare(b.name);
      });
  }, [users]);

  // İstifadəçi rolunu ikona ilə göstər
  const getRoleIcon = (role: string) => {
    switch(role) {
      case 'regionadmin':
        return <ShieldCheck className="h-4 w-4 text-blue-500 mr-2" />;
      case 'sectoradmin':
        return <ShieldCheck className="h-4 w-4 text-green-500 mr-2" />;
      case 'schooladmin':
        return <ShieldCheck className="h-4 w-4 text-amber-500 mr-2" />;
      default:
        return <UserCheck className="h-4 w-4 text-gray-500 mr-2" />;
    }
  };

  if (!region) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('assignRegionAdmin') || 'Region admini təyin et'}</DialogTitle>
          <DialogDescription>
            {`"${region.name}" regionu üçün mövcud istifadəçini admin kimi təyin edin`}
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h4 className="font-medium">{t('selectUser') || 'İstifadəçi seçin'}</h4>
            
            {usersLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : usersError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{t('errorLoadingUsers') || 'İstifadəçilər yüklənərkən xəta baş verdi'}</AlertDescription>
              </Alert>
            ) : (
              <Select 
                value={selectedUserId} 
                onValueChange={handleUserChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('selectUser') || 'İstifadəçi seçin'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{t('availableUsers') || 'Mövcud istifadəçilər'}</SelectLabel>
                    {filteredUsers.length === 0 ? (
                      <SelectItem value="no-users" disabled>
                        {t('noUsersFound') || 'İstifadəçi tapılmadı'}
                      </SelectItem>
                    ) : (
                      filteredUsers.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center">
                            {getRoleIcon(user.role)}
                            <span>{user.name} ({user.email})</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
            
            <p className="text-sm text-muted-foreground">
              {t('existingUserAdminHelp') || 'Seçilmiş istifadəçi bu region üçün admin səlahiyyətlərinə malik olacaq.'}
            </p>
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="mr-2"
              disabled={assignLoading}
            >
              {t("cancel") || 'Ləğv et'}
            </Button>
            <Button 
              type="button" 
              onClick={handleAssignAdmin} 
              disabled={assignLoading || !selectedUserId}
            >
              {assignLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("loading") || 'Yüklənir...'}
                </>
              ) : (
                t("assignAdmin") || 'Admin təyin et'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
