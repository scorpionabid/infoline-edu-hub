
import { useState, useEffect, useCallback } from 'react';
import { Sector } from '@/types/supabase';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { useSectors } from './useSectors';
import { useRegions } from './useRegions';

export type SortConfig = {
  key: string | null;
  direction: 'asc' | 'desc' | null;
};

// Əlavə edilmiş sahələrlə genişləndirilmiş Sector tipi
export type EnhancedSector = Sector & {
  schoolCount?: number;
  completionRate?: number;
  adminId?: string;
  adminEmail?: string;
  regionName?: string;
};

export const useSectorsStore = (regionId?: string) => {
  const { t } = useLanguage();
  const { sectors, loading, fetchSectors, addSector, updateSector, deleteSector } = useSectors(regionId);
  const { regions } = useRegions();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [isOperationComplete, setIsOperationComplete] = useState(false);
  const [schoolCounts, setSchoolCounts] = useState<Record<string, number>>({});
  const [completionRates, setCompletionRates] = useState<Record<string, number>>({});
  const [sectorAdmins, setSectorAdmins] = useState<Record<string, { id: string, email: string }>>({});
  
  const itemsPerPage = 5;

  // Sektorların xüsusi məlumatlarını əldə etmək
  const fetchSectorStats = useCallback(async () => {
    try {
      // Hər sektor üçün məktəb sayını əldə etmək
      const { data: schools, error: schoolError } = await supabase
        .from('schools')
        .select('*');
      
      if (schoolError) throw schoolError;
      
      // Məktəbləri sektorlara görə qruplaşdırırıq
      const schoolCountsMap: Record<string, number> = {};
      schools?.forEach(school => {
        if (school.sector_id) {
          schoolCountsMap[school.sector_id] = (schoolCountsMap[school.sector_id] || 0) + 1;
        }
      });
      setSchoolCounts(schoolCountsMap);
      
      // TODO: Tamamlanma faizini hesablamaq (bu, verilənlər bazası strukturunuzdan asılı olacaq)
      // Hələlik sadə bir misal olaraq təsadüfi dəyərlər təyin edirik
      const tempCompletionRates: Record<string, number> = {};
      sectors.forEach(sector => {
        tempCompletionRates[sector.id] = Math.floor(Math.random() * 100);
      });
      setCompletionRates(tempCompletionRates);
      
      // Admin məlumatlarını əldə etmək
      // TODO: Admin məlumatları üçün auth cədvəli ilə inteqrasiya
      // Hələlik fake admin məlumatları istifadə edirik
      const tempSectorAdmins: Record<string, { id: string, email: string }> = {};
      sectors.forEach(sector => {
        tempSectorAdmins[sector.id] = {
          id: `admin-${sector.id}`,
          email: `${sector.name.toLowerCase().replace(/\s+/g, '.')}.admin@infoline.edu`
        };
      });
      setSectorAdmins(tempSectorAdmins);
      
    } catch (error) {
      console.error("Sektor statistikalarını əldə edərkən xəta baş verdi:", error);
      toast.error(t('errorOccurred'), {
        description: t('couldNotLoadSectorStatistics')
      });
    }
  }, [sectors, t]);

  useEffect(() => {
    if (sectors.length > 0) {
      fetchSectorStats();
    }
  }, [sectors, fetchSectorStats]);

  // Əməliyyatlar tamamlandıqda verilənlərin yenilənməsi
  useEffect(() => {
    if (isOperationComplete) {
      fetchSectors();
      setIsOperationComplete(false);
    }
  }, [isOperationComplete, fetchSectors]);

  // Axtarış və filtirləmə
  const filteredSectors = sectors.filter(sector => {
    const matchesSearch = sector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (sector.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus ? sector.status === selectedStatus : true;
    const matchesRegion = regionId ? sector.region_id === regionId : true;
    
    return matchesSearch && matchesStatus && matchesRegion;
  });

  // Sıralama
  const sortedSectors = [...filteredSectors].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    // Statistika sahələri üçün xüsusi hallar
    if (sortConfig.key === 'schoolCount') {
      return sortConfig.direction === 'asc' 
        ? (schoolCounts[a.id] || 0) - (schoolCounts[b.id] || 0)
        : (schoolCounts[b.id] || 0) - (schoolCounts[a.id] || 0);
    }
    
    if (sortConfig.key === 'completionRate') {
      return sortConfig.direction === 'asc' 
        ? (completionRates[a.id] || 0) - (completionRates[b.id] || 0)
        : (completionRates[b.id] || 0) - (completionRates[a.id] || 0);
    }
    
    if (sortConfig.key === 'regionName') {
      const aRegion = regions.find(r => r.id === a.region_id);
      const bRegion = regions.find(r => r.id === b.region_id);
      return sortConfig.direction === 'asc' 
        ? (aRegion?.name || '').localeCompare(bRegion?.name || '')
        : (bRegion?.name || '').localeCompare(aRegion?.name || '');
    }
    
    // Adi sahələr üçün
    const key = sortConfig.key as keyof Sector;
    
    const aValue = a[key] || '';
    const bValue = b[key] || '';
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return 0;
  });

  // Səhifələmə
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedSectors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedSectors.length / itemsPerPage);

  // İdarəetmə funksiyaları
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);

  const handleStatusFilter = useCallback((status: string | null) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  }, []);

  const handleSort = useCallback((key: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedStatus(null);
    setSortConfig({ key: null, direction: null });
    setCurrentPage(1);
  }, []);

  // Sektor əməliyyatları
  const handleAddSector = useCallback(async (sectorData: Omit<Sector, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await addSector(sectorData);
      setIsOperationComplete(true);
      toast.success(t('sectorAdded'), {
        description: t('sectorAddedDesc')
      });
      return true;
    } catch (error) {
      console.error('Sektor əlavə edilərkən xəta baş verdi:', error);
      toast.error(t('errorOccurred'), {
        description: t('couldNotAddSector')
      });
      return false;
    }
  }, [addSector, t]);

  const handleUpdateSector = useCallback(async (id: string, updates: Partial<Sector>) => {
    try {
      await updateSector(id, updates);
      setIsOperationComplete(true);
      toast.success(t('sectorUpdated'), {
        description: t('sectorUpdatedDesc')
      });
      return true;
    } catch (error) {
      console.error('Sektor yenilənərkən xəta baş verdi:', error);
      toast.error(t('errorOccurred'), {
        description: t('couldNotUpdateSector')
      });
      return false;
    }
  }, [updateSector, t]);

  const handleDeleteSector = useCallback(async (id: string) => {
    try {
      await deleteSector(id);
      setIsOperationComplete(true);
      toast.success(t('sectorDeleted'), {
        description: t('sectorDeletedDesc')
      });
      return true;
    } catch (error) {
      console.error('Sektor silinərkən xəta baş verdi:', error);
      toast.error(t('errorOccurred'), {
        description: t('couldNotDeleteSector')
      });
      return false;
    }
  }, [deleteSector, t]);

  // Sektorlara aid statistika və admin məlumatlarını birləşdirmək
  const enhancedSectors = currentItems.map(sector => {
    const regionName = regions.find(r => r.id === sector.region_id)?.name || '';
    
    return {
      ...sector,
      schoolCount: schoolCounts[sector.id] || 0,
      completionRate: completionRates[sector.id] || 0,
      adminId: sectorAdmins[sector.id]?.id,
      adminEmail: sectorAdmins[sector.id]?.email,
      regionName
    };
  });

  return {
    sectors: enhancedSectors,
    allSectors: sectors,
    loading,
    searchTerm,
    selectedStatus,
    sortConfig,
    currentPage,
    totalPages,
    isOperationComplete,
    handleSearch,
    handleStatusFilter,
    handleSort,
    handlePageChange,
    resetFilters,
    handleAddSector,
    handleUpdateSector,
    handleDeleteSector,
    setIsOperationComplete,
    fetchSectors
  };
};
