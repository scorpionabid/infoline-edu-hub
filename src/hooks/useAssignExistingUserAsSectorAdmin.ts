
import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

export function useAssignExistingUserAsSectorAdmin() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState<boolean>(false);
  
  const assignUserAsSectorAdmin = useCallback(async (
    sectorId: string,
    userId: string
  ) => {
    try {
      setLoading(true);
      
      if (!sectorId || !userId) {
        throw new Error(t('missingRequiredFields') || 'Zəruri sahələr doldurulmayıb');
      }
      
      console.log('Sektor admini təyin edilir:', {
        sectorId,
        userId
      });
      
      // Edge funksiyasını çağırırıq
      const { data, error } = await supabase.functions.invoke('assign-existing-user-as-sector-admin', {
        body: {
          sectorId,
          userId
        }
      });
      
      if (error || !data?.success) {
        console.error('Admin təyinat xətası:', error || data?.error);
        throw new Error(data?.error || error?.message || 'Admin təyin edilərkən xəta baş verdi');
      }
      
      toast.success(
        t('sectorAdminAssignedSuccess') || 'Sektor admini uğurla təyin edildi',
        {
          description: t('userAssignedAsSectorAdmin') || 'İstifadəçi sektor admini olaraq təyin edildi'
        }
      );
      
      return { success: true };
    } catch (error: any) {
      console.error('Admin təyinat xətası:', error);
      
      toast.error(
        t('sectorAdminAssignedError') || 'Sektor admini təyin edilərkən xəta',
        {
          description: error.message
        }
      );
      
      return { 
        success: false, 
        error: error.message 
      };
    } finally {
      setLoading(false);
    }
  }, [t]);
  
  return {
    assignUserAsSectorAdmin,
    loading
  };
}
