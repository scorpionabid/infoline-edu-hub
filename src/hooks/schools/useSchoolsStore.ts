
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { School } from '@/types/supabase';
import { useRegions } from '@/hooks/regions/useRegions';
import { useSectors } from '@/hooks/sectors/useSectors';
import { toast } from 'sonner';
import { useLanguageSafe } from '@/context/LanguageContext';
import { useAuth } from '@/context/auth';
import { usePermissions } from '@/hooks/auth/usePermissions';

export interface SortConfig {
  key: string | null;
  direction: 'asc' | 'desc' | null;
}

export const useSchoolsStore = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: null });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { t } = useLanguageSafe();
  const { user } = useAuth();
  const { userRole, sectorId, regionId } = usePermissions();
  const [isOperationComplete, setIsOperationComplete] = useState(false);
  
  // Regionları və sektorları əldə etmək üçün hookları istifadə edirik
  const { regions = [], loading: regionsLoading } = useRegions() || {};
  const { sectors = [], loading: sectorsLoading } = useSectors(selectedRegion) || {};

  // Məktəbləri yükləmək metodu
  const fetchSchools = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Məktəblər yüklənir...");
      let query = supabase.from('schools').select('*');
      
      // Sectoradmin olaraq yalnız öz sektoruna aid məktəbləri görmək
      if (userRole === 'sectoradmin' && sectorId) {
        console.log("Sektor admin filtri tətbiq olunur:", sectorId);
        query = query.eq('sector_id', sectorId);
      } else {
        // Digər rollar üçün filter funksionalığı
        if (selectedRegion) {
          console.log("Region filtri tətbiq olunur:", selectedRegion);
          query = query.eq('region_id', selectedRegion);
        }
        
        if (selectedSector) {
          console.log("Sektor filtri tətbiq olunur:", selectedSector);
          query = query.eq('sector_id', selectedSector);
        }
      }
      
      if (selectedStatus) {
        console.log("Status filtri tətbiq olunur:", selectedStatus);
        query = query.eq('status', selectedStatus);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Supabase sorğu xətası:", error);
        throw error;
      }
      
      console.log("Məktəblər yükləndi:", data?.length || 0);
      setSchools(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error fetching schools:', err);
      setError(err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotLoadSchools')
      });
      setSchools([]);
    } finally {
      setLoading(false);
    }
  }, [selectedRegion, selectedSector, selectedStatus, t, userRole, sectorId]);

  // Filtrlənmiş məktəblər
  const filteredSchools = schools.filter(school => {
    if (!school) return false;
    
    const searchMatch = searchTerm
      ? (school.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (school.principal_name?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false) ||
        (school.address?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false) ||
        (school.email?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false) ||
        (school.phone?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false)
      : true;
    
    return searchMatch;
  });

  // Sıralanmış məktəblər
  const sortedSchools = [...filteredSchools].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const key = sortConfig.key as keyof School;
    const aValue = a[key] as any;
    const bValue = b[key] as any;
    
    if (!aValue && !bValue) return 0;
    if (!aValue) return sortConfig.direction === 'asc' ? 1 : -1;
    if (!bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Paginated məktəblər
  const totalPages = Math.ceil(sortedSchools.length / itemsPerPage);
  const adjustedCurrentPage = Math.min(currentPage, Math.max(1, totalPages > 0 ? totalPages : 1));
  const indexOfLastItem = adjustedCurrentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedSchools.slice(indexOfFirstItem, indexOfLastItem);

  // Sektoradmin roluna əsasən region və sektor filtrini avtomatik təyin etmək
  useEffect(() => {
    if (userRole === 'sectoradmin' && sectorId) {
      // Sektoradmin üçün sektor ID filtrini təyin edirik
      setSelectedSector(sectorId);
      
      // Sektorun aid olduğu regionu tapmaq
      const sector = sectors.find(s => s?.id === sectorId);
      if (sector && sector.region_id) {
        setSelectedRegion(sector.region_id);
      }
    } else if (userRole === 'regionadmin' && regionId) {
      // RegionAdmin üçün region filtri avtomatik təyin edilir
      setSelectedRegion(regionId);
    }
  }, [userRole, sectorId, sectors, regionId]);

  // Event handlers
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleRegionFilter = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRegion(e.target.value);
    setSelectedSector('');
    setCurrentPage(1);
  }, []);

  const handleSectorFilter = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSector(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleStatusFilter = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleSort = useCallback((key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

  const handlePageChange = useCallback((page: number) => {
    if (page > 0 && page <= (totalPages > 0 ? totalPages : 1)) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    
    // Sektoradmin üçün sektorId və regionId qalır
    if (userRole !== 'sectoradmin') {
      setSelectedRegion('');
      setSelectedSector('');
    }
    
    setSelectedStatus('');
    setCurrentPage(1);
  }, [userRole]);

  // Məlumatların ilkin yüklənməsi
  useEffect(() => {
    console.log("useEffect - fetchSchools çağırılır");
    fetchSchools();
  }, [fetchSchools]);

  return {
    schools,
    loading: loading || regionsLoading || sectorsLoading,
    error,
    searchTerm,
    selectedRegion,
    selectedSector,
    selectedStatus,
    sortConfig,
    currentPage: adjustedCurrentPage,
    itemsPerPage,
    filteredSchools,
    sortedSchools,
    currentItems,
    totalPages: totalPages > 0 ? totalPages : 1,
    regions,
    sectors,
    sectorsLoading,
    handleSearch,
    handleRegionFilter,
    handleSectorFilter,
    handleStatusFilter,
    handleSort,
    handlePageChange,
    resetFilters,
    fetchSchools, // məlumatları yenidən yükləmək üçün
    setSchools, // məktəb əlavə və ya silmək üçün
    userRole, // istifadəçi rolunu qaytarırıq
    isOperationComplete,
    setIsOperationComplete
  };
};
