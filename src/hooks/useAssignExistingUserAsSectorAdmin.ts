
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';

/**
 * Mövcud istifadəçini sektor admini kimi təyin etmək üçün hook
 */
export const useAssignExistingUserAsSectorAdmin = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  /**
   * Mövcud istifadəçini sektor admini kimi təyin edir
   * @param sectorId sektor ID
   * @param userId istifadəçi ID
   * @returns əməliyyatın nəticəsi
   */
  const assignUserAsSectorAdmin = async (sectorId: string, userId: string): Promise<{ 
    success: boolean; 
    error?: string; 
    data?: any 
  }> => {
    try {
      setLoading(true);
      
      if (!sectorId || !userId) {
        throw new Error(t('missingRequiredFields') || 'Sektor ID və istifadəçi ID tələb olunur');
      }
      
      console.log('Edge funksiyasına sorğu göndərilir:', { sectorId, userId });
      
      // Cari JWT tokeni əldə et
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Sessiya əldə edilərkən xəta:", sessionError);
        throw new Error("Avtorizasiya xətası - sessiya əldə edilə bilmədi");
      }
      
      if (!sessionData.session) {
        console.error("Aktiv istifadəçi sesiyası tapılmadı");
        throw new Error("Avtorizasiya xətası - əməliyyatı yerinə yetirmək üçün yenidən daxil olun");
      }
      
      const accessToken = sessionData.session.access_token;
      console.log("JWT token mövcuddur, uzunluq:", accessToken.length);
      
      // Fetch ilə direct sorğu göndərək
      const response = await fetch('https://olbfnauhzpdskqnxtwav.supabase.co/functions/v1/assign-existing-user-as-sector-admin', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          sectorId,
          userId
        })
      });
      
      console.log('Edge funksiyasından status kodu:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Edge funksiyası xətası:', response.status, errorText);
        throw new Error(`Server xətası (${response.status}): ${errorText || 'Bilinməyən xəta'}`);
      }
      
      const data = await response.json();
      console.log('Edge funksiyasının cavabı:', data);
      
      if (!data || !data.success) {
        console.error('Sektor admin təyinatı uğursuz oldu:', data?.error || 'Bilinməyən səbəb');
        throw new Error(data?.error || 'Əməliyyat uğursuz oldu');
      }
      
      // Uğurlu nəticə
      toast({
        title: t('adminAssignSuccess') || 'Admin təyin edildi',
        description: data.message || `İstifadəçi uğurla sektor admini təyin edildi`,
        variant: 'default'
      });
      
      return { 
        success: true, 
        data: data.data
      };
    } catch (error: any) {
      console.error('Sektor admini təyin edilərkən xəta:', error);
      
      toast({
        title: t('adminAssignError') || 'Xəta',
        description: error.message || 'Sektor admini təyin edilərkən xəta baş verdi',
        variant: 'destructive'
      });
      
      return { 
        success: false, 
        error: error.message || 'Gözlənilməz xəta' 
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    assignUserAsSectorAdmin,
    loading
  };
};
