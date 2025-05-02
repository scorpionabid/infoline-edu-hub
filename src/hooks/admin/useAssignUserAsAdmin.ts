
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/auth';

type AdminType = 'region' | 'sector' | 'school';

interface AssignAdminParams {
  adminType: AdminType;
  entityId: string;
  userId: string;
}

interface AdminAssignmentResult {
  success: boolean;
  error?: string;
  data?: any;
}

export const useAssignUserAsAdmin = () => {
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();
  const { user } = useAuth();

  const assignAdmin = useCallback(async ({ adminType, entityId, userId }: AssignAdminParams): Promise<AdminAssignmentResult> => {
    // Parameterlərin yoxlanılması
    if (!entityId || !userId) {
      const errorMessage = !entityId 
        ? `${adminType} ID təyin edilməyib`
        : 'İstifadəçi ID təyin edilməyib';
      
      console.error('Admin təyin etmək üçün parametr çatışmır:', errorMessage);
      toast.error(t('errorAssigningAdmin') || 'Admin təyin edilərkən xəta', {
        description: errorMessage
      });
      
      return { success: false, error: errorMessage };
    }
    
    // Entity tipinə görə edge funksiyasını müəyyən etmək
    const edgeFunctionName = `assign-existing-user-as-${adminType}-admin`;
    const entityParam = `${adminType}Id`;
    
    setLoading(true);
    console.log(`Admin təyin etmək üçün parametrlər: ${adminType} ID:`, entityId, 'User ID:', userId);
    
    try {
      // Edge funksiyasını çağıraq
      const { data, error } = await supabase.functions.invoke(edgeFunctionName, {
        body: { 
          userId, 
          [entityParam]: entityId,
          currentUserEmail: user?.email
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
      if (data === null || data === undefined) {
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
        description: t('adminAssignedDesc') || `İstifadəçi ${adminType} admini olaraq uğurla təyin edildi`
      });
      
      // Yeniləmə eventlərini triggerlə
      document.dispatchEvent(new Event('refresh-users'));
      document.dispatchEvent(new Event(`refresh-${adminType}s`));
      
      console.log('Admin təyinatı uğurla başa çatdı:', data);
      return { success: true, data };
      
    } catch (error: any) {
      const errorMessage = error?.message || t('unexpectedError') || 'Gözlənilməz xəta';
      console.error('Admin təyin etmək istisna:', error);
      toast.error(t('errorAssigningAdmin') || 'Admin təyin edilərkən xəta', {
        description: errorMessage
      });
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [t, user]);

  return {
    assignUserAsRegionAdmin: (regionId: string, userId: string) => 
      assignAdmin({ adminType: 'region', entityId: regionId, userId }),
    
    assignUserAsSectorAdmin: (sectorId: string, userId: string) => 
      assignAdmin({ adminType: 'sector', entityId: sectorId, userId }),
    
    assignUserAsSchoolAdmin: (schoolId: string, userId: string) => 
      assignAdmin({ adminType: 'school', entityId: schoolId, userId }),
    
    loading
  };
};
