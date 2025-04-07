
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAvailableUsers } from '@/hooks/useAvailableUsers';
import { useAssignExistingUserAsSectorAdmin } from '@/hooks/useAssignExistingUserAsSectorAdmin';
import { Sector } from '@/types/supabase';
import { useAuth } from '@/context/AuthContext';

import { 
  SectorAdminDialogHeader, 
  SectorAdminAlert, 
  SectorAdminUserSelector, 
  SectorAdminDialogFooter 
} from './';

interface ExistingUserSectorAdminDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  sector: Sector | null;
  onSuccess?: () => void;
  isEmbedded?: boolean;
}

export const ExistingUserSectorAdminDialog: React.FC<ExistingUserSectorAdminDialogProps> = ({ 
  open, 
  setOpen,
  sector,
  onSuccess,
  isEmbedded = false
}) => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  
  const { users, loading: loadingUsers, error: usersError, fetchAvailableUsers } = useAvailableUsers();
  const { assignUserAsSectorAdmin, loading: assigningUser } = useAssignExistingUserAsSectorAdmin();
  
  // Dialog açıldığında seçimləri sıfırla və istifadəçiləri yenidən yüklə
  useEffect(() => {
    if (open) {
      console.log('Dialog açıldı, istifadəçiləri yenidən yükləmə başladı...');
      setSelectedUserId("");
      setError(null);
      
      if (isAuthenticated) {
        fetchAvailableUsers();
      } else {
        setError(t('authRequiredForUsers') || 'İstifadəçiləri əldə etmək üçün giriş etməlisiniz');
      }
    }
  }, [open, fetchAvailableUsers, isAuthenticated, t]);

  // İstifadəçi seçimini emal et
  const handleUserSelect = (userId: string) => {
    console.log('Seçilmiş istifadəçi:', userId);
    setSelectedUserId(userId);
    setError(null);
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
        
        // Tətbiqi yeniləmək üçün event triggerlə
        document.dispatchEvent(new Event('refresh-users'));
        document.dispatchEvent(new Event('refresh-sectors'));
        
        // Həm də list refresh etsin
        if (onSuccess) {
          console.log('onSuccess funksiyası çağırılır...');
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

  // Dialog content
  const dialogContent = (
    <>
      <SectorAdminDialogHeader 
        sector={sector} 
        isEmbedded={isEmbedded} 
      />

      <SectorAdminAlert 
        error={error} 
        usersError={usersError} 
      />

      <div className="py-4 space-y-4">
        <SectorAdminUserSelector
          users={users}
          loading={loadingUsers}
          selectedUserId={selectedUserId}
          onUserSelect={handleUserSelect}
        />

        <SectorAdminDialogFooter
          assigningUser={assigningUser}
          selectedUserId={selectedUserId}
          onCancel={() => setOpen(false)}
          onAssignAdmin={handleAssignAdmin}
        />
      </div>
    </>
  );

  if (isEmbedded) {
    return dialogContent;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        {dialogContent}
      </DialogContent>
    </Dialog>
  );
};
