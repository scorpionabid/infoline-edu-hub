
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

interface AssignUserResult {
  success: boolean;
  error?: string;
  data?: any;
}

export const useAssignExistingUserAsSchoolAdmin = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const assignUserAsSchoolAdmin = async (schoolId: string, userId: string): Promise<AssignUserResult> => {
    try {
      setLoading(true);
      
      console.log('Admin təyin etmək üçün parametrlər: Məktəb ID:', schoolId, 'User ID:', userId);
      
      // Parametrləri doğrula
      if (!schoolId || !userId) {
        const errorMessage = !schoolId 
          ? 'Məktəb ID təyin edilməyib'
          : 'İstifadəçi ID təyin edilməyib';
          
        console.error('Admin təyin etmək üçün parametr çatışmır:', errorMessage);
        toast.error(t('errorAssigningAdmin') || 'Admin təyin edilərkən xəta', {
          description: errorMessage
        });
        return { success: false, error: errorMessage };
      }
      
      // Debug üçün əlavə məlumatlar
      console.log('Supabase Edge funksiyası çağırılır...');
      
      // Edge funksiyasını çağırarkən parametrləri düzgün formatla
      const { data, error } = await supabase.functions.invoke('assign-existing-user-as-school-admin', {
        body: {
          userId, 
          schoolId
        }
      });
      
      if (error) {
        console.error('Edge funksiya xətası:', error);
        toast.error(t('errorAssigningAdmin') || 'Admin təyin edilərkən xəta', {
          description: error.message || t('unexpectedError') || 'Gözlənilməz xəta'
        });
        return { success: false, error: error.message || t('unexpectedError') || 'Gözlənilməz xəta' };
      }
      
      console.log('Edge funksiyasından gələn cavab:', data);
      
      // Əgər data.success false olarsa (funksiya uğursuz olub)
      if (data && !data.success) {
        console.error('Admin təyin edilərkən xəta:', data.error);
        toast.error(t('errorAssigningAdmin') || 'Admin təyin edilərkən xəta', {
          description: data.error || t('unexpectedError') || 'Gözlənilməz xəta'
        });
        return { success: false, error: data.error || t('unexpectedError') || 'Gözlənilməz xəta' };
      }
      
      // Uğurlu hal
      toast.success(t('adminAssigned') || 'Admin təyin edildi', {
        description: t('adminAssignedDesc') || 'İstifadəçi məktəb admini olaraq uğurla təyin edildi'
      });
      
      // Yeniləmə eventlərini triggerlə
      document.dispatchEvent(new Event('refresh-users'));
      document.dispatchEvent(new Event('refresh-schools'));
      
      console.log('Admin təyinatı uğurla başa çatdı:', data);
      return { success: true, data };
    } catch (error: any) {
      console.error('Admin təyin etmə xətası:', error);
      toast.error(t('errorAssigningAdmin') || 'Admin təyin edilərkən xəta', {
        description: error.message || t('unexpectedError') || 'Gözlənilməz xəta'
      });
      return { success: false, error: error.message || t('unexpectedError') || 'Gözlənilməz xəta' };
    } finally {
      setLoading(false);
    }
  };
  
  return {
    assignUserAsSchoolAdmin,
    loading
  };
};
