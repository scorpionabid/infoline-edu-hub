
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Region tipini idxal edək
import { Region } from '@/types/region';

// Genişləndirilmiş Region tipi
export interface EnhancedRegion extends Region {
  sectorCount?: number;
  schoolCount?: number;
}

export const useRegionsStore = () => {
  const [regions, setRegions] = useState<EnhancedRegion[]>([]);
  const [sectors, setSectors] = useState<Array<{ id: string, name: string, region_id: string, admin_id: string | null, status: string }>>([]);
  const [schools, setSchools] = useState<Array<{ id: string, name: string, region_id: string, sector_id: string, type: string, address: string | null, admin_id: string | null, status: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState('');
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const fetchRegions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: regionsError } = await supabase
        .from('regions')
        .select('*');
      
      if (regionsError) {
        setError(regionsError.message);
        return;
      }
      
      // Əlavə məlumatlar ilə region siyahısını hazırlayaq
      if (data) {
        // Sektorlar və məktəbləri əldə edək
        const sectorResponse = await supabase.from('sectors').select('*');
        const schoolResponse = await supabase.from('schools').select('*');
        
        // Sektorların və məktəblərin sayını region-lara əlavə edək
        const enhancedRegions = data.map(region => {
          const regionSectors = sectorResponse.data?.filter(sector => sector.region_id === region.id) || [];
          const regionSchools = schoolResponse.data?.filter(school => school.region_id === region.id) || [];
          
          return {
            ...region,
            sectorCount: regionSectors.length,
            schoolCount: regionSchools.length
          };
        });
        
        setRegions(enhancedRegions);
        
        if (sectorResponse.data) {
          setSectors(sectorResponse.data);
        }
        
        if (schoolResponse.data) {
          setSchools(schoolResponse.data);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const fetchSectors = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: sectorsError } = await supabase
        .from('sectors')
        .select('*');
      
      if (sectorsError) {
        setError(sectorsError.message);
        return;
      }
      
      if (data) {
        setSectors(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const fetchSchools = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: schoolsError } = await supabase
        .from('schools')
        .select('*');
      
      if (schoolsError) {
        setError(schoolsError.message);
        return;
      }
      
      if (data) {
        setSchools(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Bölgə seçildikdə
  const handleSelectRegion = useCallback((regionId: string) => {
    setSelectedRegion(regionId);
  }, []);
  
  // Filterlənmiş sektorlar
  const filteredSectors = useCallback(() => {
    if (!selectedRegion) return [];
    
    return sectors
      .filter(sector => sector.region_id === selectedRegion)
      .map(sector => ({
        id: sector.id,
        name: sector.name,
        region_id: sector.region_id,
        admin_id: sector.admin_id,
        status: sector.status
      }));
  }, [sectors, selectedRegion]);
  
  // Filterlənmiş məktəblər
  const filteredSchools = useCallback(() => {
    if (!selectedRegion) return [];
    
    return schools.filter(school => school.region_id === selectedRegion);
  }, [schools, selectedRegion]);
  
  // Axtarış funksiyası
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);
  
  // Status filtri
  const handleStatusFilter = useCallback((status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  }, []);
  
  // Səhifələmə
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);
  
  // Filterləri sıfırlamaq
  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedStatus('all');
    setCurrentPage(1);
  }, []);
  
  // Region əlavə etmək
  const handleAddRegion = useCallback(async (regionData: Partial<Region>) => {
    try {
      const { data, error } = await supabase
        .from('regions')
        .insert([regionData])
        .select()
        .single();
        
      if (error) throw error;
      
      fetchRegions();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [fetchRegions]);
  
  // Region yeniləmək
  const handleUpdateRegion = useCallback(async (id: string, regionData: Partial<Region>) => {
    try {
      const { error } = await supabase
        .from('regions')
        .update(regionData)
        .eq('id', id);
        
      if (error) throw error;
      
      fetchRegions();
      return true;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [fetchRegions]);
  
  // Region silmək
  const handleDeleteRegion = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('regions')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      fetchRegions();
      return true;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [fetchRegions]);
  
  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);
  
  return {
    regions,
    sectors,
    schools,
    loading,
    error,
    selectedRegion,
    searchTerm,
    selectedStatus,
    currentPage,
    totalPages,
    handleSearch,
    handleStatusFilter,
    handlePageChange,
    resetFilters,
    setSelectedRegion: handleSelectRegion,
    fetchRegions,
    fetchSectors,
    fetchSchools,
    filteredSectors: filteredSectors(),
    filteredSchools: filteredSchools(),
    handleAddRegion,
    handleUpdateRegion,
    handleDeleteRegion
  };
};
