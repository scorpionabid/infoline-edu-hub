
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
    // Zəruri parametrləri yoxla
    if (!schoolId || !userId) {
      const errorMessage = !schoolId 
        ? t('schoolIdNotProvided') || 'Məktəb ID təyin edilməyib'
        : t('userIdNotProvided') || 'İstifadəçi ID təyin edilməyib';
          
      console.error('Admin təyin etmək üçün parametr çatışmır:', errorMessage);
      toast.error(t('errorAssigningAdmin') || 'Admin təyin edilərkən xəta', {
        description: errorMessage
      });
      
      return { success: false, error: errorMessage };
    }
    
    setLoading(true);
    console.log('Admin təyin etmək üçün parametrlər: Məktəb ID:', schoolId, 'User ID:', userId);
    
    try {
      // Edge funksiyasını çağıraq
      const { data, error } = await supabase.functions.invoke('assign-existing-user-as-school-admin', {
        body: { 
          userId, 
          schoolId 
        }
      });
      
      console.log('Edge funksiyasından gələn cavab:', data, 'xəta:', error);
      
      // Əgər API sorğusu xəta verərsə
      if (error) {
        const errorMessage = error.message || t('unexpectedError') || 'Gözlənilməz xəta';
        console.error('Edge funksiya xətası:', error);
        toast.error(t('errorAssigningAdmin') || 'Admin təyin edilərkən xəta', {
          description: errorMessage
        });
        
        return { success: false, error: errorMessage };
      }
      
      // data null və ya undefined olarsa
      if (!data) {
        const errorMessage = t('noResponseFromServer') || 'Serverdən cavab alınmadı';
        console.error('Edge funksiyasından gələn cavab boşdur');
        toast.error(t('errorAssigningAdmin') || 'Admin təyin edilərkən xəta', {
          description: errorMessage
        });
        
        return { success: false, error: errorMessage };
      }
      
      // Əgər data.success false olarsa (funksiya uğursuz olub)
      if (data && data.success === false) {
        const errorMessage = data.error || t('unexpectedError') || 'Gözlənilməz xəta';
        console.error('Admin təyin edilərkən xəta:', errorMessage);
        toast.error(t('errorAssigningAdmin') || 'Admin təyin edilərkən xəta', {
          description: errorMessage
        });
        
        return { success: false, error: errorMessage };
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
      const errorMessage = error.message || t('unexpectedError') || 'Gözlənilməz xəta';
      console.error('Admin təyin etmək istisna:', error);
      toast.error(t('errorAssigningAdmin') || 'Admin təyin edilərkən xəta', {
        description: errorMessage
      });
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };
  
  return {
    assignUserAsSchoolAdmin,
    loading
  };
};
