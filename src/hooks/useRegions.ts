import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { Region } from '@/types/supabase';
import { fetchRegions, addRegion, updateRegion, deleteRegion } from '@/services/regionService';
import { useAuth } from '@/context/AuthContext';

export const useRegions = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { t } = useLanguage();
  const { user } = useAuth();

  const fetchRegionsData = async () => {
    setLoading(true);
    
    try {
      console.log('Regionlar yüklənir...');
      
      // Əgər istifadəçi mövcud deyilsə, boş massiv qaytaraq
      if (!user) {
        console.warn('İstifadəçi autentifikasiya olunmayıb, regionlar yüklənmir');
        setRegions([]);
        setLoading(false);
        return;
      }
      
      const data = await fetchRegions();
      console.log(`${data.length} region uğurla yükləndi`);
      setRegions(data);
    } catch (err: any) {
      console.error('Regionlar yüklənərkən xəta:', err);
      setError(err);
      
      // Xəta halında gizli şəkildə davam etməyə çalışırıq
      setRegions([]);
      
      // Yalnız auth olmadıqda və ya icazə xətaları olduqda toast göstəririk
      if (err.code === 'PGRST301' || err.code === '42501' || err.code === '403') {
        toast.error(t('authError'), {
          description: t('loginRequired')
        });
      } else {
        toast.error(t('errorOccurred'), {
          description: t('couldNotLoadRegions')
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const addNewRegion = async (region: Omit<Region, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const data = await addRegion(region);
      
      setRegions(prev => [...prev, data as Region]);
      toast.success(t('regionAdded'), {
        description: t('regionAddedDesc')
      });
      
      return data;
    } catch (err: any) {
      console.error('Region əlavə edilərkən xəta:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotAddRegion')
      });
      throw err;
    }
  };

  const updateExistingRegion = async (id: string, updates: Partial<Region>) => {
    try {
      const data = await updateRegion(id, updates);
      
      setRegions(prev => prev.map(region => 
        region.id === id ? { ...region, ...data } as Region : region
      ));
      
      toast.success(t('regionUpdated'), {
        description: t('regionUpdatedDesc')
      });
      
      return data;
    } catch (err: any) {
      console.error('Region yenilənərkən xəta:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotUpdateRegion')
      });
      throw err;
    }
  };

  const deleteExistingRegion = async (id: string) => {
    try {
      const result = await deleteRegion(id);
      
      if (result.success) {
        setRegions(prev => prev.filter(region => region.id !== id));
        
        toast.success(t('regionDeleted'), {
          description: t('regionDeletedDesc')
        });
        
        return true;
      } else {
        throw new Error(result.error || 'Bilinməyən xəta');
      }
    } catch (err: any) {
      console.error('Region silinərkən xəta:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotDeleteRegion')
      });
      throw err;
    }
  };

  useEffect(() => {
    // İstifadəçi dəyişdikdə regionları yenidən yükləyirik
    if (user) {
      fetchRegionsData();
    } else {
      // İstifadəçi yoxdursa, regions-i təmizləyirik
      setRegions([]);
    }
  }, [user]);

  return {
    regions,
    loading,
    error,
    fetchRegions: fetchRegionsData,
    addRegion: addNewRegion,
    updateRegion: updateExistingRegion,
    deleteRegion: deleteExistingRegion
  };
};