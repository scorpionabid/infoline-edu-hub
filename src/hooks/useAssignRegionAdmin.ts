
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

interface AdminData {
  regionId: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}

export const useAssignRegionAdmin = () => {
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();
  const { user } = useAuth();

  const assignAdmin = useCallback(async (data: AdminData) => {
    setLoading(true);
    
    try {
      console.log('Admin təyin etmə məlumatları:', {
        regionId: data.regionId,
        adminName: data.adminName,
        adminEmail: data.adminEmail ? `${data.adminEmail.substring(0, 3)}***` : undefined
      });
      
      // Admin təyin etmək üçün edge funksiyasını çağırırıq
      const { data: responseData, error } = await supabase.functions.invoke('assign-region-admin', {
        body: {
          ...data,
          currentUserEmail: user?.email
        }
      });
      
      console.log('Edge funksiyası cavabı:', responseData);
      
      if (error) {
        console.error('Edge funksiyası xətası:', error);
        throw new Error(error.message || 'Admin təyin edilərkən xəta baş verdi');
      }
      
      if (responseData && responseData.error) {
        console.error('Admin təyin etmə xətası cavabı:', responseData.error);
        throw new Error(responseData.error);
      }
      
      if (!responseData || !responseData.success) {
        throw new Error('Admin təyin edilərkən naməlum xəta baş verdi');
      }
      
      // Uğurlu mesaj
      toast.success(t('adminAssigned') || 'Admin uğurla təyin edildi');
      
      return { success: true, data: responseData };
    } catch (error: any) {
      console.error('Admin təyin etmə xətası:', error);
      
      let errorMessage = t('errorAssigningAdmin') || 'Admin təyin edilərkən xəta baş verdi';
      
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
    assignAdmin,
    loading
  };
};
