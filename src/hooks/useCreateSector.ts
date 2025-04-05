
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

interface SectorData {
  name: string;
  description?: string;
  region_id: string;
  status?: string;
}

export const useCreateSector = () => {
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();
  const { user } = useAuth();

  const createSector = useCallback(async (data: SectorData) => {
    setLoading(true);
    
    try {
      console.log('Sektor yaratma məlumatları:', {
        name: data.name,
        description: data.description,
        region_id: data.region_id,
        status: data.status
      });
      
      // Sektoru database-ə əlavə edirik
      const { data: newSector, error } = await supabase
        .from('sectors')
        .insert([{
          name: data.name,
          description: data.description,
          region_id: data.region_id,
          status: data.status || 'active'
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Sektor yaratma xətası:', error);
        throw new Error(error.message || 'Sektor yaradılarkən xəta baş verdi');
      }
      
      if (!newSector) {
        throw new Error('Sektor yaradılarkən naməlum xəta baş verdi');
      }
      
      // Uğurlu mesaj
      toast.success(t('sectorCreated') || 'Sektor uğurla yaradıldı');
      
      return { success: true, data: { sector: newSector } };
    } catch (error: any) {
      console.error('Sektor yaratma xətası:', error);
      
      let errorMessage = t('errorCreatingSector') || 'Sektor yaradılarkən xəta baş verdi';
      
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
    createSector,
    loading
  };
};
