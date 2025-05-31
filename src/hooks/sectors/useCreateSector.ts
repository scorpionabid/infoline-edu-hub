import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';

interface SectorData {
  name: string;
  description?: string;
  region_id: string;
  status?: string;
}

export const useCreateSector = () => {
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();
  const user = useAuthStore(selectUser);

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
        .insert({
          name: data.name,
          description: data.description,
          region_id: data.region_id,
          status: data.status || 'active'
        })
        .select()
        .single();
      
      if (error) {
        console.error('Sektor yaratma xətası:', error);
        throw new Error(error.message || 'Sektor yaradılarkən xəta baş verdi');
      }
      
      if (!newSector) {
        throw new Error('Sektor yaradılarkən naməlum xəta baş verdi');
      }
      
      toast.success(t('sectorCreatedSuccessfully'));
      return newSector;
    } catch (error: any) {
      console.error('Sektor yaratma xətası:', error);
      toast.error(error.message || t('errorCreatingSector'));
      return null;
    } finally {
      setLoading(false);
    }
  }, [t, user]);

  return {
    loading,
    createSector
  };
};

export default useCreateSector;
