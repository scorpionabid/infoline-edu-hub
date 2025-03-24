
import { useState, useEffect, useCallback } from 'react';
import { Region } from '@/types/supabase';
import { useRegions } from './useRegions';
import { useSectors } from './useSectors';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';

export type SortConfig = {
  key: string | null;
  direction: 'asc' | 'desc' | null;
};

// Əlavə edilmiş sahələrlə genişləndirilmiş Region tipi
export type EnhancedRegion = Region & {
  schoolCount?: number;
  sectorCount?: number;
  completionRate?: number;
  adminId?: string;
  adminEmail?: string;
};

export const useRegionsStore = () => {
  const { t } = useLanguage();
  const { regions, loading, fetchRegions, addRegion, updateRegion, deleteRegion } = useRegions();
  const { sectors } = useSectors();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [isOperationComplete, setIsOperationComplete] = useState(false);
  const [schoolCounts, setSchoolCounts] = useState<Record<string, number>>({});
  const [sectorCounts, setSectorCounts] = useState<Record<string, number>>({});
  const [completionRates, setCompletionRates] = useState<Record<string, number>>({});
  const [regionAdmins, setRegionAdmins] = useState<Record<string, { id: string, email: string }>>({});
  
  const itemsPerPage = 5;

  // Regionların xüsusi məlumatlarını əldə etmək
  const fetchRegionStats = useCallback(async () => {
    try {
      // Hər region üçün məktəb sayını əldə etmək
      const { data: schoolCountsData, error: schoolError } = await supabase
        .from('schools')
        .select('region_id, count(*)')
        .group('region_id');
      
      if (schoolError) throw schoolError;
      
      const schoolCountsMap: Record<string, number> = {};
      schoolCountsData?.forEach(item => {
        schoolCountsMap[item.region_id] = parseInt(item.count);
      });
      setSchoolCounts(schoolCountsMap);
      
      // Sektorları regionlara görə qruplaşdırmaq
      const sectorCountsMap: Record<string, number> = {};
      sectors.forEach(sector => {
        if (sector.region_id) {
          sectorCountsMap[sector.region_id] = (sectorCountsMap[sector.region_id] || 0) + 1;
        }
      });
      setSectorCounts(sectorCountsMap);
      
      // TODO: Tamamlanma faizini hesablamaq (bu, verilənlər bazası strukturunuzdan asılı olacaq)
      // Hələlik sadə bir misal olaraq təsadüfi dəyərlər təyin edirik
      const tempCompletionRates: Record<string, number> = {};
      regions.forEach(region => {
        tempCompletionRates[region.id] = Math.floor(Math.random() * 100);
      });
      setCompletionRates(tempCompletionRates);
      
      // Admin məlumatlarını əldə etmək
      // TODO: Admin məlumatları üçün auth cədvəli ilə inteqrasiya
      // Hələlik boş bir obyekt istifadə edirik
      const tempRegionAdmins: Record<string, { id: string, email: string }> = {};
      regions.forEach(region => {
        tempRegionAdmins[region.id] = {
          id: `admin-${region.id}`,
          email: `${region.name.toLowerCase().replace(/\s+/g, '.')}.admin@infoline.edu`
        };
      });
      setRegionAdmins(tempRegionAdmins);
      
    } catch (error) {
      console.error("Region statistikalarını əldə edərkən xəta baş verdi:", error);
      toast.error(t('errorOccurred'), {
        description: t('couldNotLoadRegionStatistics')
      });
    }
  }, [regions, sectors, t]);

  useEffect(() => {
    if (regions.length > 0) {
      fetchRegionStats();
    }
  }, [regions, fetchRegionStats]);

  // Əməliyyatlar tamamlandıqda verilənlərin yenilənməsi
  useEffect(() => {
    if (isOperationComplete) {
      fetchRegions();
      setIsOperationComplete(false);
    }
  }, [isOperationComplete, fetchRegions]);

  // Axtarış və filtirləmə
  const filteredRegions = regions.filter(region => {
    const matchesSearch = region.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (region.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus ? region.status === selectedStatus : true;
    
    return matchesSearch && matchesStatus;
  });

  // Sıralama
  const sortedRegions = [...filteredRegions].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    // Statistika sahələri üçün xüsusi hallar
    if (sortConfig.key === 'schoolCount') {
      return sortConfig.direction === 'asc' 
        ? (schoolCounts[a.id] || 0) - (schoolCounts[b.id] || 0)
        : (schoolCounts[b.id] || 0) - (schoolCounts[a.id] || 0);
    }
    
    if (sortConfig.key === 'sectorCount') {
      return sortConfig.direction === 'asc' 
        ? (sectorCounts[a.id] || 0) - (sectorCounts[b.id] || 0)
        : (sectorCounts[b.id] || 0) - (sectorCounts[a.id] || 0);
    }
    
    if (sortConfig.key === 'completionRate') {
      return sortConfig.direction === 'asc' 
        ? (completionRates[a.id] || 0) - (completionRates[b.id] || 0)
        : (completionRates[b.id] || 0) - (completionRates[a.id] || 0);
    }
    
    // Adi sahələr üçün
    const key = sortConfig.key as keyof Region;
    
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
  const currentItems = sortedRegions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedRegions.length / itemsPerPage);

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

  // Region əməliyyatları
  const handleAddRegion = useCallback(async (regionData: Omit<Region, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await addRegion(regionData);
      setIsOperationComplete(true);
      return true;
    } catch (error) {
      console.error('Region əlavə edilərkən xəta baş verdi:', error);
      return false;
    }
  }, [addRegion]);

  const handleUpdateRegion = useCallback(async (id: string, updates: Partial<Region>) => {
    try {
      await updateRegion(id, updates);
      setIsOperationComplete(true);
      return true;
    } catch (error) {
      console.error('Region yenilənərkən xəta baş verdi:', error);
      return false;
    }
  }, [updateRegion]);

  const handleDeleteRegion = useCallback(async (id: string) => {
    try {
      await deleteRegion(id);
      setIsOperationComplete(true);
      return true;
    } catch (error) {
      console.error('Region silinərkən xəta baş verdi:', error);
      return false;
    }
  }, [deleteRegion]);

  // Regionlara aid statistika və admin məlumatlarını birləşdirmək
  const enhancedRegions = currentItems.map(region => ({
    ...region,
    schoolCount: schoolCounts[region.id] || 0,
    sectorCount: sectorCounts[region.id] || 0,
    completionRate: completionRates[region.id] || 0,
    adminId: regionAdmins[region.id]?.id,
    adminEmail: regionAdmins[region.id]?.email
  }));

  return {
    regions: enhancedRegions,
    allRegions: regions,
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
    handleAddRegion,
    handleUpdateRegion,
    handleDeleteRegion,
    setIsOperationComplete,
    fetchRegions
  };
};
