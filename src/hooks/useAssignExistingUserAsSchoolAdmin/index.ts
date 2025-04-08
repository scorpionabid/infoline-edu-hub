
import { useState } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { useAssignParamValidation } from './validation';
import { assignSchoolAdminApi } from './api';
import { AssignUserResult, UseAssignExistingUserAsSchoolAdminReturn } from './types';

export const useAssignExistingUserAsSchoolAdmin = (): UseAssignExistingUserAsSchoolAdminReturn => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const { validateParams } = useAssignParamValidation();

  const assignUserAsSchoolAdmin = async (schoolId: string, userId: string): Promise<AssignUserResult> => {
    // Zəruri parametrləri yoxla
    const validation = validateParams(schoolId, userId);
    if (!validation.isValid) {
      console.error('Admin təyin etmək üçün parametr çatışmır:', validation.errorMessage);
      toast.error(t('errorAssigningAdmin') || 'Admin təyin edilərkən xəta', {
        description: validation.errorMessage
      });
      
      return { success: false, error: validation.errorMessage };
    }
    
    setLoading(true);
    console.log('Admin təyin etmək üçün parametrlər: Məktəb ID:', schoolId, 'User ID:', userId);
    
    try {
      const result = await assignSchoolAdminApi({ schoolId, userId });
      
      if (result.success) {
        toast.success(t('adminAssigned') || 'Admin təyin edildi', {
          description: t('adminAssignedDesc') || 'İstifadəçi məktəb admini olaraq uğurla təyin edildi'
        });
        
        // Yeniləmə eventlərini triggerlə
        document.dispatchEvent(new Event('refresh-users'));
        document.dispatchEvent(new Event('refresh-schools'));
      } else {
        toast.error(t('errorAssigningAdmin') || 'Admin təyin edilərkən xəta', {
          description: result.error
        });
      }
      
      return result;
    } finally {
      setLoading(false);
    }
  };
  
  return { assignUserAsSchoolAdmin, loading };
};
