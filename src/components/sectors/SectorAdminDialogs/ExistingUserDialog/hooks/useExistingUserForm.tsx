
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useAvailableUsers } from '@/hooks/useAvailableUsers';
import { useAssignExistingUserAsSectorAdmin } from '@/hooks/useAssignExistingUserAsSectorAdmin';
import { Sector, FullUserData } from '@/types/supabase';

export const useExistingUserForm = (sector: Sector | null, onSuccess?: () => void, setOpen?: (open: boolean) => void) => {
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
    if (users && users.length > 0) {
      console.log(`${users.length} istifadəçi filtrlənəcək. Mövcud adminlər göstərilsin? ${showExistingAdmins}`);
      
      if (showExistingAdmins) {
        // Bütün istifadəçiləri göstər
        setFilteredUsers(users);
      } else {
        // Təyin edilməmiş istifadəçiləri və sektoradmin olmayan istifadəçiləri göstər
        const filtered = users.filter(user => {
          // Əvvəlcədən superadmin və regionadminlər hər zaman göstərilir
          if (user.role === 'superadmin' || user.role === 'regionadmin') {
            return true;
          }
          
          // Adi istifadəçilər (rolu user olanlar) hər zaman göstərilir
          if (user.role === 'user') {
            return true;
          }
          
          // Artıq sektoradmin olanları filtrləyək (özü admin olan sektordan başqa)
          if (user.role === 'sectoradmin') {
            // Admin təyin edilməyibsə
            if (!user.sector_id) {
              return true;
            }
            // Hazırda baxılan sektorun admini deyilsə, göstərmirik
            return false;
          }
          
          // Məktəb adminlərini yoxla
          if (user.role === 'schooladmin') {
            // Sektor, region və məktəbə bağlı olmayanları göstər
            // Hazırda istifadəçi təyin edilməyibsə
            if (!user.sector_id && !user.region_id && !user.school_id) {
              return true;
            }
            // Başqa sektorlardakı məktəblərə bağlı olanları göstərmə
            return false;
          }
          
          return true;
        });
        
        console.log(`Filtrdən sonra ${filtered.length} istifadəçi qaldı`);
        setFilteredUsers(filtered);
      }
    } else {
      setFilteredUsers([]);
    }
  }, [users, showExistingAdmins]);
  
  // Dialog açıldığında seçimləri sıfırla və istifadəçiləri yenidən yüklə
  const resetForm = () => {
    console.log('Form sıfırlanır, istifadəçiləri yenidən yükləmə başladı...');
    setSelectedUserId("");
    setError(null);
    setShowExistingAdmins(false);
    form.reset({ showExistingAdmins: false });
    
    if (isAuthenticated) {
      fetchAvailableUsers();
    } else {
      setError(t('authRequiredForUsers') || 'İstifadəçiləri əldə etmək üçün giriş etməlisiniz');
    }
  };

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
        console.log('Admin uğurla təyin edildi:', result);
        if (setOpen) setOpen(false);
        
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
  
  // Checkbox dəyişikliyi
  const handleCheckboxChange = (checked: boolean) => {
    const isChecked = Boolean(checked);
    console.log('Checkbox dəyişdi:', isChecked);
    setShowExistingAdmins(isChecked);
    form.setValue('showExistingAdmins', isChecked);
  };

  return {
    form,
    selectedUserId,
    error,
    usersError,
    filteredUsers,
    loadingUsers,
    assigningUser,
    showExistingAdmins,
    handleUserSelect,
    handleAssignAdmin,
    handleForceRefresh,
    handleCheckboxChange,
    resetForm
  };
};
