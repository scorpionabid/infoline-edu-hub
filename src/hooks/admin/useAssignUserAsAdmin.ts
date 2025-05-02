
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";

interface AssignUserParams {
  userId: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
}

interface AssignUserResult {
  success: boolean;
  data?: any;
  error?: string;
}

export const useAssignUserAsAdmin = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  
  /**
   * İstifadəçini müvafiq adminstrativ rola təyin edir
   * @param params userId və təyin ediləcək entity ID-ləri 
   */
  const assignUserAsAdmin = async (params: AssignUserParams): Promise<AssignUserResult> => {
    const { userId, regionId, sectorId, schoolId } = params;
    
    try {
      setLoading(true);
      
      // Zəruri parametrləri yoxla
      if (!userId) {
        const errorMessage = 'İstifadəçi ID təyin edilməyib';
        console.error(errorMessage);
        toast.error(t('errorAssigningAdmin'), {
          description: errorMessage
        });
        return { success: false, error: errorMessage };
      }
      
      // Hansı tip admin təyin edilməsini müəyyən et
      let functionName = '';
      let adminType = '';
      let entityId = '';
      
      if (regionId) {
        functionName = 'assign_region_admin';
        adminType = 'Region';
        entityId = regionId;
      } else if (sectorId) {
        functionName = 'assign_sector_admin';
        adminType = 'Sektor';
        entityId = sectorId;
      } else if (schoolId) {
        functionName = 'assign_school_admin';
        adminType = 'Məktəb'; 
        entityId = schoolId;
      } else {
        const errorMessage = 'Admin təyin etmək üçün region, sektor və ya məktəb ID tələb olunur';
        console.error(errorMessage);
        toast.error(t('errorAssigningAdmin'), {
          description: errorMessage
        });
        return { success: false, error: errorMessage };
      }
      
      console.log(`${adminType} admini təyin etmə parametrləri:`, { userId, entityId });
      
      // Supabase funksiyasını çağır
      const { data, error } = await supabase.rpc(functionName, {
        p_entity_id: entityId,
        p_user_id: userId
      });
      
      if (error) {
        console.error(`${adminType} admini təyin etmə xətası:`, error);
        toast.error(t('errorAssigningAdmin'), {
          description: error.message || t('unexpectedError')
        });
        return { success: false, error: error.message || t('unexpectedError') };
      }
      
      // Uğurlu hal
      toast.success(t('adminAssigned'), {
        description: t('adminAssignedDesc')
      });
      
      console.log(`${adminType} admin təyinatı uğurla başa çatdı:`, data);
      
      // Yeniləmə eventlərini triggerlə
      document.dispatchEvent(new Event('refresh-users'));
      document.dispatchEvent(new Event('refresh-regions'));
      document.dispatchEvent(new Event('refresh-sectors'));
      document.dispatchEvent(new Event('refresh-schools'));
      
      return { success: true, data };
    } catch (error: any) {
      console.error('Admin təyin etmə istisna:', error);
      toast.error(t('errorAssigningAdmin'), {
        description: error.message || t('unexpectedError')
      });
      return { success: false, error: error.message || t('unexpectedError') };
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Region admini təyin et
   */
  const assignRegionAdmin = async (regionId: string, userId: string): Promise<AssignUserResult> => {
    return assignUserAsAdmin({ userId, regionId });
  };
  
  /**
   * Sektor admini təyin et
   */
  const assignSectorAdmin = async (sectorId: string, userId: string): Promise<AssignUserResult> => {
    return assignUserAsAdmin({ userId, sectorId });
  };
  
  /**
   * Məktəb admini təyin et
   */
  const assignSchoolAdmin = async (schoolId: string, userId: string): Promise<AssignUserResult> => {
    return assignUserAsAdmin({ userId, schoolId });
  };
  
  return {
    loading,
    assignUserAsAdmin,
    assignRegionAdmin,
    assignSectorAdmin,
    assignSchoolAdmin
  };
};

export default useAssignUserAsAdmin;
