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
        console.error('Region və admin yaratma xətası cavabı:', responseData.error);
        throw new Error(responseData.error);
      }
      
      if (!responseData || !responseData.success) {
        throw new Error('Region və admin yaradılarkən naməlum xəta baş verdi');
      }
      
      const successMessage = shouldCreateAdmin 
        ? t('regionAndAdminCreatedSuccessfully') 
        : t('regionCreatedSuccessfully');
      
      toast.success(successMessage);
      return responseData.data;
    } catch (error: any) {
      console.error('Region və admin yaratma xətası:', error);
      toast.error(error.message || t('errorCreatingRegionAndAdmin'));
      return null;
    } finally {
      setLoading(false);
    }
  }, [t, user]);

  return {
    loading,
    createRegionWithAdmin
  };
};

export default useCreateRegionAdmin;
