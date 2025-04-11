
import { useState } from 'react';
import { useSchoolsData } from './useSchoolsData';
import { useSchoolsFilters } from './useSchoolsFilters';
import { usePermissions } from '@/services/permissions/usePermissions';
import { useRegions } from '../useRegions';
import { useSectors } from '../useSectors';

/**
 * Məktəb idarəetməsi üçün əsas hook
 */
export const useSchoolsManager = () => {
  const { userRole, regionId, sectorId } = usePermissions();
  const [isOperationComplete, setIsOperationComplete] = useState(false);
  
  // Məktəb məlumatlarını əldə etmək
  const {
    schools,
    loading,
    error,
    fetchSchoolsData,
    setSchools
  } = useSchoolsData();
  
  // Regionları və sektorları əldə etmək
  const { regions } = useRegions();
  const { sectors, loading: sectorsLoading } = useSectors(regionId);
  
  // Filtrləmə və sıralama
  const {
    searchTerm,
    selectedRegion,
    selectedSector,
    selectedStatus,
    sortConfig,
    currentPage,
    filteredSchools,
    sortedSchools,
    currentItems,
    totalPages,
    handleSearch,
    handleRegionFilter,
    handleSectorFilter,
    handleStatusFilter,
    handleSort,
    handlePageChange,
    resetFilters
  } = useSchoolsFilters({
    schools,
    sectorId,
    regionId
  });
  
  // Əməliyyat tamamlandıqda məlumatları yeniləmək
  useEffect(() => {
    if (isOperationComplete) {
      fetchSchoolsData(selectedRegion, selectedSector, selectedStatus);
      setIsOperationComplete(false);
    }
  }, [isOperationComplete, fetchSchoolsData, selectedRegion, selectedSector, selectedStatus]);
  
  return {
    // Məlumatlar
    schools,
    loading,
    error,
    regions,
    sectors,
    sectorsLoading,
    
    // Filtr vəziyyəti
    searchTerm,
    selectedRegion,
    selectedSector,
    selectedStatus,
    sortConfig,
    currentPage,
    
    // Nəticələr
    filteredSchools,
    sortedSchools,
    currentItems,
    totalPages,
    
    // İdarəetmə funksiyaları
    handleSearch,
    handleRegionFilter,
    handleSectorFilter,
    handleStatusFilter,
    handleSort,
    handlePageChange,
    resetFilters,
    fetchSchools: fetchSchoolsData,
    setSchools,
    
    // Əməliyyat vəziyyəti
    isOperationComplete,
    setIsOperationComplete,
    
    // İstifadəçi məlumatı
    userRole
  };
};
