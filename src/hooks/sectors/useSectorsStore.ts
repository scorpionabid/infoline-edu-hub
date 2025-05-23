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
      
      // Məlumatları əldə etmək
      const { data: sectorsData, error } = await query;
      
      if (error) {
        throw error;
      }
      
      // Region adlarını və məktəblərin sayını əldə etmək
      const enhancedSectors = await Promise.all((sectorsData || []).map(async (sector) => {
        // Region adını əldə etmək
        let regionName = '';
        if (sector.region_id) {
          const { data: regionData } = await supabase
            .from('regions')
            .select('name')
            .eq('id', sector.region_id)
            .single();
            
          if (regionData) {
            regionName = regionData.name;
          }
        }
        
        // Məktəblərin sayını əldə etmək
        let schoolCount = 0;
        const { count } = await supabase
          .from('schools')
          .select('id', { count: 'exact' })
          .eq('sector_id', sector.id);
          
        if (count !== null) {
          schoolCount = count;
        }
        
        // Giriş və yeniləmə tarixlərini formatlamaq
        return {
          ...sector,
          regionName,
          schoolCount
        };
      }));
      
      // Axtarış etmək
      const filteredSectors = enhancedSectors.filter(sector => {
        const matchesSearch = !searchTerm || 
          sector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (sector.description && sector.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (sector.regionName && sector.regionName.toLowerCase().includes(searchTerm.toLowerCase()));
          
        return matchesSearch;
      });
      
      // Səhifələnmə
      const totalItems = filteredSectors.length;
      const calculatedTotalPages = Math.ceil(totalItems / itemsPerPage);
      setTotalPages(calculatedTotalPages || 1);
      
      // Cari səhifə üçün sektorları əldə etmək
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedSectors = filteredSectors.slice(startIndex, endIndex);
      
      setSectors(paginatedSectors);
    } catch (error: any) {
      console.error('Sektorları yükləyərkən xəta:', error);
      toast.error(t('errorLoadingSectors'));
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedRegion, selectedStatus, t, user]);
  
  // Filtr dəyişdikdə sektorları yenidən yükləmək
  useEffect(() => {
    fetchSectors();
  }, [fetchSectors]);
  
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);
  
  const handleRegionFilter = useCallback((regionId: string) => {
    setSelectedRegion(regionId);
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
    if (!(user && user.role === 'regionadmin' && user.regionId)) {
      setSelectedRegion('');
    }
    setSelectedStatus(null);
    setCurrentPage(1);
  }, [user]);
  
  // Sektor əlavə etmək
  const addSector = useCallback(async (sectorData: Partial<Sector>) => {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .insert([sectorData])
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success(t('sectorAddedSuccessfully'));
      fetchSectors();
      return data;
    } catch (error: any) {
      console.error('Sektor əlavə edilərkən xəta:', error);
      toast.error(t('errorAddingSector'));
      return null;
    }
  }, [fetchSectors, t]);
  
  // Sektoru yeniləmək
  const updateSector = useCallback(async (id: string, sectorData: Partial<Sector>) => {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .update(sectorData)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success(t('sectorUpdatedSuccessfully'));
      fetchSectors();
      return data;
    } catch (error: any) {
      console.error('Sektor yenilənilərkən xəta:', error);
      toast.error(t('errorUpdatingSector'));
      return null;
    }
  }, [fetchSectors, t]);
  
  // Sektoru silmək
  const deleteSector = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('sectors')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success(t('sectorDeletedSuccessfully'));
      fetchSectors();
      return true;
    } catch (error: any) {
      console.error('Sektor silinərkən xəta:', error);
      toast.error(t('errorDeletingSector'));
      return false;
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
    fetchSectors,
    addSector,
    updateSector,
    deleteSector
  };
};

export default useSectorsStore;
