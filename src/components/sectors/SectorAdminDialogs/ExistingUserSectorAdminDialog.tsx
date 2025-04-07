
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAvailableUsers } from '@/hooks/useAvailableUsers';
import { useAssignExistingUserAsSectorAdmin } from '@/hooks/useAssignExistingUserAsSectorAdmin';
import { Sector, FullUserData } from '@/types/supabase';
import { useAuth } from '@/context/AuthContext';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';

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
  const [showExistingAdmins, setShowExistingAdmins] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<FullUserData[]>([]);
  
  // Form yaratmaq
  const form = useForm({
    defaultValues: {
      showExistingAdmins: false
    }
  });
  
  const { users, loading: loadingUsers, error: usersError, fetchAvailableUsers } = useAvailableUsers();
  const { assignUserAsSectorAdmin, loading: assigningUser } = useAssignExistingUserAsSectorAdmin();
  
  // Adminləri filtirləmək üçün effekt
  useEffect(() => {
    if (users) {
      if (showExistingAdmins) {
        // Bütün istifadəçiləri göstər
        setFilteredUsers(users);
      } else {
        // Mövcud adminləri gizlət
        setFilteredUsers(users.filter(user => {
          return !user.role || 
            (user.role === 'sectoradmin' && !user.sector_id) ||
            (user.role !== 'superadmin' && user.role !== 'regionadmin' && 
             user.role !== 'sectoradmin' && user.role !== 'schooladmin');
        }));
      }
    }
  }, [users, showExistingAdmins]);
  
  // Dialog açıldığında seçimləri sıfırla və istifadəçiləri yenidən yüklə
  useEffect(() => {
    if (open) {
      console.log('Dialog açıldı, istifadəçiləri yenidən yükləmə başladı...');
      setSelectedUserId("");
      setError(null);
      setShowExistingAdmins(false);
      form.reset({ showExistingAdmins: false });
      
      if (isAuthenticated) {
        fetchAvailableUsers();
      } else {
        setError(t('authRequiredForUsers') || 'İstifadəçiləri əldə etmək üçün giriş etməlisiniz');
      }
    }
  }, [open, fetchAvailableUsers, isAuthenticated, t, form]);

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

  // Məcburi yeniləmə
  const handleForceRefresh = () => {
    if (isAuthenticated) {
      console.log('İstifadəçilər məcburi yenilənir...');
      fetchAvailableUsers();
    }
  };

  // Dialog content
  const dialogContent = (
    <Form {...form}>
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
          users={filteredUsers}
          loading={loadingUsers}
          selectedUserId={selectedUserId}
          onUserSelect={handleUserSelect}
          onRefresh={handleForceRefresh}
        />
        
        <FormField
          control={form.control}
          name="showExistingAdmins"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2 mt-2">
              <FormControl>
                <Checkbox
                  checked={showExistingAdmins}
                  onCheckedChange={(checked) => {
                    setShowExistingAdmins(Boolean(checked));
                    field.onChange(Boolean(checked));
                  }}
                />
              </FormControl>
              <div className="space-y-0 leading-none">
                <FormLabel>{t("showExistingAdmins") || 'Mövcud adminləri göstər'}</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <SectorAdminDialogFooter
          assigningUser={assigningUser}
          selectedUserId={selectedUserId}
          onCancel={() => setOpen(false)}
          onAssignAdmin={handleAssignAdmin}
        />
      </div>
    </Form>
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
