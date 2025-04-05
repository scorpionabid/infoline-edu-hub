
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

interface RegionAdminData {
  regionName: string;
  regionDescription?: string;
  regionStatus?: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}

export const useCreateRegionAdmin = () => {
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const createRegionWithAdmin = useCallback(async (data: RegionAdminData) => {
    setLoading(true);
    
    try {
      // Region və Admin-i yaratmaq üçün edge funksiyasını çağırırıq
      const { data: responseData, error } = await supabase.functions.invoke('create-region-admin', {
        body: data
      });
      
      if (error) {
        throw new Error(error.message || 'Region və admin yaradılarkən xəta baş verdi');
      }
      
      console.log('Region yaradıldı:', responseData);
      toast.success(t('regionCreated'));
      
      return { success: true, data: responseData };
    } catch (error: any) {
      console.error('Region yaratma xətası:', error);
      
      let errorMessage = t('errorCreatingRegion');
      
      // Specific error messages
      if (error.message && error.message.includes('mövcuddur')) {
        errorMessage = error.message;
      }
      
      toast.error(t('errorOccurred'), {
        description: errorMessage
      });
      
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [t]);

  return {
    createRegionWithAdmin,
    loading
  };
};
