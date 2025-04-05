
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sector } from '@/types/supabase';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

export interface EnhancedSector extends Sector {
  regionName?: string;
  schoolCount?: number;
  completionRate?: number;
}

export const useSectorsStore = (initialRegionId?: string) => {
  const [sectors, setSectors] = useState<EnhancedSector[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>(initialRegionId || '');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { t } = useLanguage();
  const { user } = useAuth();
  const itemsPerPage = 10;

  const fetchSectors = useCallback(async () => {
    setLoading(true);
    try {
      // Temel sorgu
      let query = supabase
        .from('sectors')
        .select(`
          *,
          regions:region_id (name)
        `);

      // Region filtrəsi
      if (selectedRegion) {
        query = query.eq('region_id', selectedRegion);
      } else if (user?.regionId) {
        // İstifadəçi regionadmin isə avtomatik olaraq öz regionuna filtrələnir
        query = query.eq('region_id', user.regionId);
      }

      // Status filtrəsi
      if (selectedStatus) {
        query = query.eq('status', selectedStatus);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (!data) {
        setSectors([]);
        setTotalPages(1);
        setLoading(false);
        return;
      }

      // Məktəb sayını və tamamlanma faizini əldə et
      const enhancedSectorsPromises = data.map(async (sector) => {
        // Məktəb sayını əldə et
        const { count: schoolCount, error: schoolError } = await supabase
          .from('schools')
          .select('id', { count: true })
          .eq('sector_id', sector.id);

        if (schoolError) {
          console.error('Məktəb sayı əldə edilərkən xəta:', schoolError);
        }

        // Region adını əldə et
        const regionName = sector.regions ? sector.regions.name : '';

        // Tamamlanma faizini əldə et (daha sonra implementasiya ediləcək)
        // Bu hissə məlumat girişləri implementasiya edildikdən sonra əlavə ediləcək
        const completionRate = 0;

        return {
          ...sector,
          regionName,
          schoolCount: schoolCount || 0,
          completionRate
        } as EnhancedSector;
      });

      const enhancedSectors = await Promise.all(enhancedSectorsPromises);
      
      // Sektorları filtrələyək və səhifələyək
      const filteredSectors = enhancedSectors.filter(sector => 
        sector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sector.description && sector.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sector.regionName && sector.regionName.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      setTotalPages(Math.ceil(filteredSectors.length / itemsPerPage));
      
      const paginatedSectors = filteredSectors.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      );

      setSectors(paginatedSectors);
    } catch (err: any) {
      console.error('Sektorlar əldə edilərkən xəta:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotLoadSectors')
      });
    } finally {
      setLoading(false);
    }
  }, [selectedRegion, selectedStatus, searchTerm, currentPage, t, user?.regionId]);

  // Hər dəfə filtr dəyişdikdə, məlumatları yenilə
  useEffect(() => {
    fetchSectors();
  }, [fetchSectors]);

  // Axtarış mətni dəyişdikdə
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  // Region filtrəsi dəyişdikdə
  const handleRegionFilter = useCallback((value: string) => {
    setSelectedRegion(value);
    setCurrentPage(1);
  }, []);

  // Status filtrəsi dəyişdikdə
  const handleStatusFilter = useCallback((value: string | null) => {
    setSelectedStatus(value);
    setCurrentPage(1);
  }, []);

  // Səhifə dəyişdikdə
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Filtrləri sıfırla
  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedStatus(null);
    // İstifadəçi regionadmin isə, region filtrəsini sıfırlama
    if (!user?.regionId) {
      setSelectedRegion('');
    }
    setCurrentPage(1);
  }, [user?.regionId]);

  // Yeni sektor əlavə et
  const handleAddSector = useCallback(async (sectorData: Partial<Sector>) => {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .insert([sectorData])
        .select()
        .single();

      if (error) throw error;

      toast.success(t('sectorCreated'), {
        description: t('sectorCreatedDesc')
      });

      fetchSectors();
      return data;
    } catch (err: any) {
      console.error('Sektor əlavə edilərkən xəta:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotAddSector')
      });
      throw err;
    }
  }, [fetchSectors, t]);

  // Sektor güncəllə
  const handleUpdateSector = useCallback(async (id: string, sectorData: Partial<Sector>) => {
    try {
      const { error } = await supabase
        .from('sectors')
        .update(sectorData)
        .eq('id', id);

      if (error) throw error;

      toast.success(t('sectorUpdated'), {
        description: t('sectorUpdatedDesc')
      });

      fetchSectors();
    } catch (err: any) {
      console.error('Sektor yenilənərkən xəta:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotUpdateSector')
      });
      throw err;
    }
  }, [fetchSectors, t]);

  // Sektor sil
  const handleDeleteSector = useCallback(async (id: string) => {
    try {
      // Əvvəlcə bu sektora aid məktəbləri yoxlayaq
      const { count, error: countError } = await supabase
        .from('schools')
        .select('id', { count: true })
        .eq('sector_id', id);

      if (countError) throw countError;

      if (count && count > 0) {
        toast.error(t('cannotDeleteSector'), {
          description: t('sectorHasSchools')
        });
        return;
      }

      const { error } = await supabase
        .from('sectors')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success(t('sectorDeleted'), {
        description: t('sectorDeletedDesc')
      });

      fetchSectors();
    } catch (err: any) {
      console.error('Sektor silinərkən xəta:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotDeleteSector')
      });
      throw err;
    }
  }, [fetchSectors, t]);

  return {
    sectors,
    loading,
    searchTerm,
    selectedRegion,
    selectedStatus,
    currentPage,
    totalPages,
    handleSearch,
    handleRegionFilter,
    handleStatusFilter,
    handlePageChange,
    resetFilters,
    handleAddSector,
    handleUpdateSector,
    handleDeleteSector,
    fetchSectors
  };
};
