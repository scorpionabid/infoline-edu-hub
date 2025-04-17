
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sector } from '@/types/supabase';
import { useAuth } from '@/context/auth';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';

export interface EnhancedSector extends Sector {
  regionName?: string;
  schoolCount?: number;
}

export const useSectorsStore = () => {
  const [sectors, setSectors] = useState<EnhancedSector[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const itemsPerPage = 10;

  // İstifadəçinin regionuna əsasən filtrləmək
  useEffect(() => {
    if (user && user.role === 'regionadmin' && user.regionId) {
      setSelectedRegion(user.regionId);
    }
  }, [user]);

  const fetchSectors = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from('sectors').select('*');
      
      // İstifadəçinin roluna görə filtrləmək
      if (user && user.role === 'regionadmin' && user.regionId) {
        query = query.eq('region_id', user.regionId);
      } else if (selectedRegion) {
        query = query.eq('region_id', selectedRegion);
      }
      
      if (selectedStatus) {
        query = query.eq('status', selectedStatus);
      }
      
      // Sıralama
      query = query.order('name', { ascending: true });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Region adlarını və məktəb saylarını əldə etmək
      const enhancedSectors = await Promise.all((data || []).map(async (sector) => {
        // Region adını əldə et
        const { data: regionData } = await supabase
          .from('regions')
          .select('name')
          .eq('id', sector.region_id)
          .single();
        
        // Sektora aid məktəblərin sayını əldə et
        const { count: schoolCount } = await supabase
          .from('schools')
          .select('*', { count: "exact" })
          .eq('sector_id', sector.id);
          
        return {
          ...sector,
          regionName: regionData?.name,
          schoolCount: schoolCount || 0
        };
      }));
      
      setSectors(enhancedSectors as EnhancedSector[]);
      setTotalPages(Math.ceil(enhancedSectors.length / itemsPerPage));
    } catch (error: any) {
      toast.error(t('errorOccurred'), {
        description: error.message
      });
      console.error('Error fetching sectors:', error);
    } finally {
      setLoading(false);
    }
  }, [user, selectedRegion, selectedStatus, t, itemsPerPage]);

  useEffect(() => {
    fetchSectors();
  }, [fetchSectors]);

  // Axtarış termi və filtrlərə əsasən məlumatları filtrlə
  const filteredSectors = sectors.filter(sector => {
    const nameMatch = sector.name.toLowerCase().includes(searchTerm.toLowerCase());
    const descMatch = sector.description ? sector.description.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    
    return nameMatch || descMatch;
  });
  
  // Səhifələmə
  const paginatedSectors = filteredSectors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Sektor əlavə etmək
  const handleAddSector = async (sectorData: Omit<Sector, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .insert([sectorData])
        .select()
        .single();
      
      if (error) throw error;
      
      await fetchSectors();
      return data;
    } catch (error: any) {
      toast.error(t('errorOccurred'), {
        description: error.message
      });
      throw error;
    }
  };

  // Sektoru yeniləmək
  const handleUpdateSector = async (id: string, sectorData: Partial<Sector>) => {
    try {
      const { error } = await supabase
        .from('sectors')
        .update(sectorData)
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchSectors();
    } catch (error: any) {
      toast.error(t('errorOccurred'), {
        description: error.message
      });
      throw error;
    }
  };

  // Sektoru silmək
  const handleDeleteSector = async (id: string) => {
    try {
      // Sektorun məktəbləri varmı yoxla
      const { count } = await supabase
        .from('schools')
        .select('*', { count: "exact" })
        .eq('sector_id', id);
      
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
      
      toast.success(t('sectorDeleted'));
      await fetchSectors();
    } catch (error: any) {
      toast.error(t('errorOccurred'), {
        description: error.message
      });
    }
  };

  // Axtarış və filtrləmə işləyicilər
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);

  const handleRegionFilter = useCallback((region: string) => {
    setSelectedRegion(region);
    setCurrentPage(1);
  }, []);

  const handleStatusFilter = useCallback((status: string | null) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    // regionadmin isə region seçimini sıfırlama
    if (!(user && user.role === 'regionadmin' && user.regionId)) {
      setSelectedRegion('');
    }
    setSelectedStatus(null);
    setCurrentPage(1);
  }, [user]);

  return {
    sectors: paginatedSectors,
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
