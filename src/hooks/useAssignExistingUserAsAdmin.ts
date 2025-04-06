
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

export const useAssignExistingUserAsAdmin = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  // Mövcud istifadəçini region admin kimi təyin etmə funksiyası
  const assignUserAsRegionAdmin = async (regionId: string, userId: string) => {
    try {
      setLoading(true);
      
      console.log('Admin təyin etmək: Region ID:', regionId, 'User ID:', userId);
      
      // Parametrləri doğrula
      if (!regionId || !userId) {
        const errorMessage = !regionId 
          ? 'Region ID təyin edilməyib'
          : 'İstifadəçi ID təyin edilməyib';
          
        console.error(errorMessage);
        toast.error(t('errorAssigningAdmin'), {
          description: errorMessage
        });
        return { success: false, error: errorMessage };
      }
      
      // Supabase edge funksiyasını çağır
      const { data, error } = await supabase.functions.invoke('assign-existing-user-as-admin', {
        body: {
          regionId, 
          userId
        }
      });
      
      if (error) {
        console.error('Edge funksiya xətası:', error);
        toast.error(t('errorAssigningAdmin'), {
          description: error.message || t('unexpectedError')
        });
        return { success: false, error: error.message || t('unexpectedError') };
      }
      
      // Əgər edge funksiyası xəta qaytarıbsa
      if (data && data.error) {
        console.error('Admin təyin edilərkən xəta:', data.error);
        toast.error(t('errorAssigningAdmin'), {
          description: data.error || t('unexpectedError')
        });
        return { success: false, error: data.error || t('unexpectedError') };
      }
      
      // Uğurlu hal
      toast.success(t('adminAssigned'), {
        description: t('adminAssignedDesc')
      });
      
      console.log('Admin təyinatı uğurla başa çatdı:', data);
      return { success: true, data };
    } catch (error: any) {
      console.error('Admin təyin etmə xətası:', error);
      toast.error(t('errorAssigningAdmin'), {
        description: error.message || t('unexpectedError')
      });
      return { success: false, error: error.message || t('unexpectedError') };
    } finally {
      setLoading(false);
    }
  };
  
  return {
    assignUserAsRegionAdmin,
    loading
  };
};
