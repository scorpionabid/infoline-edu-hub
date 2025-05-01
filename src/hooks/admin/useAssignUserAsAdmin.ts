
import { useState } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

type AdminType = 'region' | 'sector' | 'school';

interface AssignUserParams {
  userId: string;
  entityId: string;
  adminType: AdminType;
}

interface AssignUserResult {
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * Universal admin təyinat hook'u
 * Region, Sektor və ya Məktəb adminlərini təyin etmək üçün vahid interfeys təklif edir
 */
export const useAssignUserAsAdmin = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const validateParams = (entityId: string, userId: string, adminType: AdminType): { isValid: boolean; errorMessage?: string } => {
    if (!entityId) {
      return { isValid: false, errorMessage: `${adminType.charAt(0).toUpperCase() + adminType.slice(1)} ID təyin edilməyib` };
    }
    
    if (!userId) {
      return { isValid: false, errorMessage: t('userIdNotProvided') || 'İstifadəçi ID təyin edilməyib' };
    }
    
    return { isValid: true };
  };

  const getEdgeFunctionName = (adminType: AdminType): string => {
    switch (adminType) {
      case 'region':
        return 'assign-existing-user-as-region-admin';
      case 'sector':
        return 'assign-existing-user-as-sector-admin';
      case 'school':
        return 'assign-existing-user-as-school-admin';
      default:
        throw new Error(`Tanınmayan admin tipi: ${adminType}`);
    }
  };

  const getParamName = (adminType: AdminType): string => {
    switch (adminType) {
      case 'region':
        return 'regionId';
      case 'sector':
        return 'sectorId';
      case 'school':
        return 'schoolId';
      default:
        throw new Error(`Tanınmayan admin tipi: ${adminType}`);
    }
  };

  const assignUserAsAdmin = async ({
    userId, 
    entityId, 
    adminType
  }: AssignUserParams): Promise<AssignUserResult> => {
    // Zəruri parametrləri yoxla
    const validation = validateParams(entityId, userId, adminType);
    if (!validation.isValid) {
      console.error('Admin təyin etmək üçün parametr çatışmır:', validation.errorMessage);
      toast.error(t('errorAssigningAdmin') || 'Admin təyin edilərkən xəta', {
        description: validation.errorMessage
      });
      
      return { success: false, error: validation.errorMessage };
    }
    
    setLoading(true);
    console.log(`${adminType} admin təyin etmək üçün parametrlər:`, { userId, entityId });
    
    try {
      // Edge funksiyasını çağıraq
      const functionName = getEdgeFunctionName(adminType);
      const paramName = getParamName(adminType);
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { 
          userId, 
          [paramName]: entityId 
        }
      });
      
      console.log(`${adminType} admin edge funksiyasından gələn cavab:`, data, 'xəta:', error);
      
      if (error) {
        throw new Error(error.message || t('unexpectedError') || 'Gözlənilməz xəta');
      }
      
      if (data === null || data === undefined) {
        throw new Error(t('noResponseFromServer') || 'Serverdən cavab alınmadı');
      }
      
      if (data && data.success === false) {
        throw new Error(data.error || t('unexpectedError') || 'Gözlənilməz xəta');
      }
      
      const successMessage = `${adminType === 'region' ? 'Region' : adminType === 'sector' ? 'Sektor' : 'Məktəb'} admini uğurla təyin edildi`;
      
      toast.success(t('adminAssigned') || 'Admin təyin edildi', {
        description: t('adminAssignedDesc') || successMessage
      });
      
      // Yeniləmə eventlərini triggerlə
      document.dispatchEvent(new Event('refresh-users'));
      document.dispatchEvent(new Event(`refresh-${adminType}s`));
      
      return { success: true, data };
      
    } catch (error: any) {
      console.error('Admin təyin etmək istisna:', error);
      const errorMessage = error?.message || t('unexpectedError') || 'Gözlənilməz xəta';
      
      toast.error(t('errorAssigningAdmin') || 'Admin təyin edilərkən xəta', {
        description: errorMessage
      });
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };
  
  // Xüsusi kolleksiya funksiyaları
  const assignUserAsRegionAdmin = (regionId: string, userId: string) => 
    assignUserAsAdmin({ userId, entityId: regionId, adminType: 'region' });
  
  const assignUserAsSectorAdmin = (sectorId: string, userId: string) => 
    assignUserAsAdmin({ userId, entityId: sectorId, adminType: 'sector' });
  
  const assignUserAsSchoolAdmin = (schoolId: string, userId: string) => 
    assignUserAsAdmin({ userId, entityId: schoolId, adminType: 'school' });
  
  return {
    assignUserAsAdmin,
    assignUserAsRegionAdmin, 
    assignUserAsSectorAdmin,
    assignUserAsSchoolAdmin,
    loading
  };
};

export default useAssignUserAsAdmin;
