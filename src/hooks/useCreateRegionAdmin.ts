
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/auth';

interface RegionAdminData {
  regionName: string;
  regionDescription?: string;
  regionStatus?: string;
  adminName?: string;  // opsional edildi
  adminEmail?: string; // opsional edildi
  adminPassword?: string; // opsional edildi
  skipAdminCreation?: boolean; // Yeni parametr əlavə edildi
}

export const useCreateRegionAdmin = () => {
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();
  const { user } = useAuth();

  const createRegionWithAdmin = useCallback(async (data: RegionAdminData) => {
    setLoading(true);
    
    try {
      // Əgər admin məlumatları yoxdursa və ya skipAdminCreation=true, 
      // yalnız region yaradılacaq
      const shouldCreateAdmin = !data.skipAdminCreation && 
                             data.adminName && 
                             data.adminEmail && 
                             data.adminPassword;
      
      console.log('Region yaratma məlumatları:', {
        regionName: data.regionName,
        regionDescription: data.regionDescription,
        skipAdminCreation: data.skipAdminCreation,
        willCreateAdmin: shouldCreateAdmin,
        adminEmail: data.adminEmail ? `${data.adminEmail.substring(0, 3)}***` : undefined
      });
      
      // Region və Admin-i yaratmaq üçün edge funksiyasını çağırırıq
      const { data: responseData, error } = await supabase.functions.invoke('create-region-admin', {
        body: {
          ...data,
          currentUserEmail: user?.email, // İstifadəçi email-ini əlavə edirik
          skipAdminCreation: data.skipAdminCreation || !shouldCreateAdmin
        }
      });
      
      console.log('Edge funksiyası cavabı:', responseData);
      
      if (error) {
        console.error('Edge funksiyası xətası:', error);
        throw new Error(error.message || 'Region və admin yaradılarkən xəta baş verdi');
      }
      
      if (responseData && responseData.error) {
        console.error('Region yaratma xətası cavabı:', responseData.error);
        throw new Error(responseData.error);
      }
      
      if (!responseData || !responseData.success) {
        throw new Error('Region yaradılarkən naməlum xəta baş verdi');
      }
      
      // Administrasiya məlumatları ilə bağlı əlavə yoxlama
      if (!data.skipAdminCreation && shouldCreateAdmin && !responseData.adminCreated) {
        console.warn('Region yaradıldı, lakin admin yaradılmadı:', responseData);
        toast.warning(t('adminNotCreated') || 'Region yaradıldı, lakin admin yaradılmadı');
      }
      
      // Uğurlu mesaj
      let successMessage = data.skipAdminCreation || !shouldCreateAdmin
        ? t('regionCreatedWithoutAdmin') || 'Region uğurla yaradıldı (admin olmadan)'
        : t('regionCreated') || 'Region və region admini uğurla yaradıldı';
      
      toast.success(successMessage);
      
      return { success: true, data: responseData };
    } catch (error: any) {
      console.error('Region yaratma xətası:', error);
      
      let errorMessage = t('errorCreatingRegion') || 'Region yaradılarkən xəta baş verdi';
      
      // Specific error messages
      if (error.message) {
        if (error.message.includes('not allowed') || error.message.includes('not_admin')) {
          errorMessage = t('insufficientPermissions') || 
            'Admin yaratmaq üçün kifayət qədər icazə yoxdur. Yalnız region yaratmağı sınayın.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(t('errorOccurred') || 'Xəta baş verdi', {
        description: errorMessage
      });
      
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [t, user]);

  return {
    createRegionWithAdmin,
    loading
  };
};
