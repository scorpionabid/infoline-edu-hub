import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';

// Region tipini birbaşa burada təyin edirik
export interface Region {
  id: string;
  name: string;
  description?: string;
  status: string;
  admin_id?: string;
  admin_email?: string;
  created_at: string;
  updated_at: string;
}

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
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [isOperationComplete, setIsOperationComplete] = useState(false);
  const [schoolCounts, setSchoolCounts] = useState<Record<string, number>>({});
  const [sectorCounts, setSectorCounts] = useState<Record<string, number>>({});
  const [completionRates, setCompletionRates] = useState<Record<string, number>>({});
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [regionsError, setRegionsError] = useState<string | null>(null);
  
  const itemsPerPage = 5;

  // Regionların xüsusi məlumatlarını əldə etmək
  const fetchRegionStats = useCallback(async (data: Region[]) => {
    try {
      // Hər region üçün məktəb sayını əldə etmək
      const { data: schools, error: schoolError } = await supabase
        .from('schools')
        .select('*');
      
      if (schoolError) throw schoolError;
      
      // Məktəbləri regionlara görə qruplaşdırırıq
      const schoolCountsMap: Record<string, number> = {};
      schools?.forEach(school => {
        if (school.region_id) {
          schoolCountsMap[school.region_id] = (schoolCountsMap[school.region_id] || 0) + 1;
        }
      });
      setSchoolCounts(schoolCountsMap);
      
      // Sektorları regionlara görə qruplaşdırmaq
      const sectorCountsMap: Record<string, number> = {};
      const { data: sectors, error: sectorsError } = await supabase
        .from('sectors')
        .select('*');
      
      if (sectorsError) throw sectorsError;
      
      sectors.forEach(sector => {
        if (sector.region_id) {
          sectorCountsMap[sector.region_id] = (sectorCountsMap[sector.region_id] || 0) + 1;
        }
      });
      setSectorCounts(sectorCountsMap);
      
      // Tamamlanma faizini data_entries cədvəlindən əldə etmək
      // Hər region üçün Bütün data_entries-ləri sayırıq və tamamlanma faizini hesablayırıq
      const { data: dataEntries, error: dataEntriesError } = await supabase
        .from('data_entries')
        .select(`
          status,
          school_id,
          schools(region_id)
        `);
      
      if (dataEntriesError) throw dataEntriesError;
      
      // Region əsaslı tamamlanma faizi hesablaması
      const completionRatesTemp: Record<string, {total: number, completed: number}> = {};
      
      dataEntries?.forEach(entry => {
        if (entry.schools && entry.schools.region_id) {
          const regionId = entry.schools.region_id;
          
          if (!completionRatesTemp[regionId]) {
            completionRatesTemp[regionId] = { total: 0, completed: 0 };
          }
          
          completionRatesTemp[regionId].total += 1;
          
          if (entry.status === 'approved') {
            completionRatesTemp[regionId].completed += 1;
          }
        }
      });
      
      // Faiz hesablaması
      const calculatedRates: Record<string, number> = {};
      Object.entries(completionRatesTemp).forEach(([regionId, data]) => {
        if (data.total > 0) {
          calculatedRates[regionId] = Math.round((data.completed / data.total) * 100);
        } else {
          calculatedRates[regionId] = 0;
        }
      });
      
      setCompletionRates(calculatedRates);
      
    } catch (error) {
      console.error("Region statistikalarını əldə edərkən xəta baş verdi:", error);
      toast.error(t('errorOccurred'), {
        description: t('couldNotLoadRegionStatistics')
      });
    }
  }, [t]);

  // Regionları yükləmək
  const fetchRegions = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setRegionsError(null);
    
    console.log('Fetching regions data in useRegionsStore...');
    console.log('Auth state:', { isAuthenticated, userId: user?.id });
    
    try {
      // Regions hook-unu çağır
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Error fetching regions in useRegionsStore:', error);
        setRegionsError(error.message);
        setLoading(false);
        return;
      }
      
      console.log('Regions data fetched in useRegionsStore:', data);
      
      if (data && data.length > 0) {
        setRegions(data);
      } else {
        setRegions([]);
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Failed to fetch regions in useRegionsStore:', error);
      setRegionsError(error.message || 'Regionları yükləmək mümkün olmadı');
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Yeni Supabase versiyası üçün getSession() metodunu istifadə edirik
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData?.session) {
          const { data: userData, error } = await supabase.auth.getUser();
          
          if (error) {
            console.error('Error fetching user in useRegionsStore:', error);
            setUser(null);
            setIsAuthenticated(false);
            return;
          }
          
          const user = userData?.user || null;
          console.log('User fetched in useRegionsStore:', user);
          setUser(user);
          setIsAuthenticated(!!user);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Failed to fetch user in useRegionsStore:', error);
        setUser(null);
        setIsAuthenticated(false);
      }
    };
    
    fetchUser();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRegions();
    }
  }, [fetchRegions, isAuthenticated]);

  useEffect(() => {
    if (regions.length > 0) {
      fetchRegionStats(regions);
    }
  }, [regions, fetchRegionStats]);

  // Əməliyyatlar tamamlandıqda verilənlərin yenilənməsi
  useEffect(() => {
    if (isOperationComplete) {
      const fetchRegions = async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('regions')
            .select('*');
          
          if (error) throw error;
          
          setRegions(data);
        } catch (error) {
          console.error('Regions could not be fetched:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchRegions();
      setIsOperationComplete(false);
    }
  }, [isOperationComplete]);

  // Axtarış və filtirləmə
  const filteredRegions = regions.filter(region => {
    const matchesSearch = region.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (region.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus ? region.status === selectedStatus : true;
    
    return matchesSearch && matchesStatus;
  });

  console.log('Original regions:', regions);
  console.log('Filtered regions:', filteredRegions);

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

  console.log('Sorted regions:', sortedRegions);

  // Səhifələmə
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedRegions.slice(indexOfFirstItem, indexOfLastItem);

  console.log('Current items (paginated):', currentItems);

  // Regionlara aid statistika və admin məlumatlarını birləşdirmək
  const enhancedRegions = currentItems.map(region => ({
    ...region,
    schoolCount: schoolCounts[region.id] || 0,
    sectorCount: sectorCounts[region.id] || 0,
    completionRate: completionRates[region.id] || 0,
    adminId: region.admin_id,
    adminEmail: region.admin_email
  }));

  console.log('Enhanced regions (final):', enhancedRegions);

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
      const { data, error } = await supabase
        .from('regions')
        .insert(regionData)
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('Region added successfully:', data);
      setIsOperationComplete(true);
      return true;
    } catch (error) {
      console.error('Error adding region:', error);
      return false;
    }
  }, []);

  const handleUpdateRegion = useCallback(async (id: string, updates: Partial<Region>) => {
    try {
      const { data, error } = await supabase
        .from('regions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('Region updated successfully:', data);
      setIsOperationComplete(true);
      return true;
    } catch (error) {
      console.error('Error updating region:', error);
      return false;
    }
  }, []);

  const handleDeleteRegion = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('regions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      console.log('Region deleted successfully');
      setIsOperationComplete(true);
      return true;
    } catch (error) {
      console.error('Error deleting region:', error);
      return false;
    }
  }, []);

  return {
    regions: enhancedRegions,
    allRegions: regions,
    loading,
    searchTerm,
    selectedStatus,
    sortConfig,
    currentPage,
    totalPages: Math.ceil(sortedRegions.length / itemsPerPage),
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
