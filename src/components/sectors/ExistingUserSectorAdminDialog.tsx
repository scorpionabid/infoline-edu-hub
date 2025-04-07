
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAvailableUsers } from '@/hooks/useAvailableUsers';
import { useAssignExistingUserAsSectorAdmin } from '@/hooks/useAssignExistingUserAsSectorAdmin';
import { Sector } from '@/types/supabase';

interface ExistingUserSectorAdminDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  sector: Sector | null;
  onSuccess?: () => void;
}

export const ExistingUserSectorAdminDialog: React.FC<ExistingUserSectorAdminDialogProps> = ({ 
  open, 
  setOpen,
  sector,
  onSuccess
}) => {
  const { t } = useLanguage();
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  
  const { users, loading: loadingUsers, fetchAvailableUsers } = useAvailableUsers();
  const { assignUserAsSectorAdmin, loading: assigningUser } = useAssignExistingUserAsSectorAdmin();
  
  // Dialog açıldığında seçimləri sıfırla və istifadəçiləri yenidən yüklə
  useEffect(() => {
    if (open) {
      setSelectedUserId("");
      setError(null);
      fetchAvailableUsers();
      console.log('Dialog açıldı, istifadəçilər yüklənir...');
    }
  }, [open, fetchAvailableUsers]);

  // İstifadəçi seçimini emal et
  const handleUserSelect = (userId: string) => {
    console.log('Seçilmiş istifadəçi:', userId);
    setSelectedUserId(userId);
  };

  // Sektora admin təyin et
  const handleAssignAdmin = async () => {
    if (!selectedUserId) {
      setError(t('selectUserFirst') || 'Zəhmət olmasa bir istifadəçi seçin');
      return;
    }

    if (!sector?.id) {
      setError(t('invalidSector') || 'Sektor məlumatları düzgün deyil');
      return;
    }

    try {
      console.log('Admin təyin etmə başladı:', { sectorId: sector.id, userId: selectedUserId });
      const result = await assignUserAsSectorAdmin(sector.id, selectedUserId);
      
      if (result.success) {
        console.log('Admin uğurla təyin edildi');
        setOpen(false);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        console.error('Admin təyin etmə xətası:', result.error);
        setError(result.error || t('assignmentFailed') || 'Admin təyin edilərkən xəta baş verdi');
      }
    } catch (error: any) {
      console.error('Admin təyin etmə istisna:', error);
      setError(error.message || t('unexpectedError') || 'Gözlənilməz xəta');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('assignExistingUserAsSectorAdmin') || 'Mövcud istifadəçini sektor admini təyin et'}</DialogTitle>
          <DialogDescription>
            {t('sectorAdminExistingDesc') || `"${sector?.name}" sektoru üçün mövcud istifadəçini admin kimi təyin edin`}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user-select">{t('selectUser') || 'İstifadəçi seçin'}</Label>
            <Select
              value={selectedUserId}
              onValueChange={handleUserSelect}
              disabled={loadingUsers || users.length === 0}
            >
              <SelectTrigger id="user-select">
                <SelectValue placeholder={t('selectUser') || 'İstifadəçi seçin'} />
              </SelectTrigger>
              <SelectContent>
                {loadingUsers && (
                  <div className="p-2 text-center text-sm text-muted-foreground">
                    {t('loading') || 'Yüklənir...'}
                  </div>
                )}
                {!loadingUsers && users.length === 0 && (
                  <div className="p-2 text-center text-sm text-muted-foreground">
                    {t('noUsersFound') || 'İstifadəçi tapılmadı'}
                  </div>
                )}
                {!loadingUsers && users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name || 'İstifadəçi'} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
            >
              {t('cancel') || 'Ləğv et'}
            </Button>
            <Button 
              onClick={handleAssignAdmin}
              disabled={!selectedUserId || assigningUser}
            >
              {assigningUser && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('assignAdmin') || 'Admin təyin et'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
