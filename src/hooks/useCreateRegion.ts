
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/auth';

interface RegionData {
  name: string;
  description?: string;
  status?: string;
}

export const useCreateRegion = () => {
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();
  const { user } = useAuth();

  const createRegion = useCallback(async (data: RegionData) => {
    setLoading(true);
    
    try {
      console.log('Region yaratma məlumatları:', {
        name: data.name,
        description: data.description,
        status: data.status
      });
      
      // Region yaratmaq üçün edge funksiyasını çağırırıq
      const { data: responseData, error } = await supabase.functions.invoke('create-region', {
        body: {
          ...data,
          currentUserEmail: user?.email
        }
      });
      
      console.log('Edge funksiyası cavabı:', responseData);
      
      if (error) {
        console.error('Edge funksiyası xətası:', error);
        throw new Error(error.message || 'Region yaradılarkən xəta baş verdi');
      }
      
      if (responseData && responseData.error) {
        console.error('Region yaratma xətası cavabı:', responseData.error);
        throw new Error(responseData.error);
      }
      
      if (!responseData || !responseData.success) {
        throw new Error('Region yaradılarkən naməlum xəta baş verdi');
      }
      
      // Uğurlu mesaj
      toast.success(t('regionCreated') || 'Region uğurla yaradıldı');
      
      return { success: true, data: responseData };
    } catch (error: any) {
      console.error('Region yaratma xətası:', error);
      
      let errorMessage = t('errorCreatingRegion') || 'Region yaradılarkən xəta baş verdi';
      
      if (error.message) {
        errorMessage = error.message;
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
    createRegion,
    loading
  };
};
