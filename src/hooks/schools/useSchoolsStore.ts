
import { useState, useEffect, useCallback, useMemo } from 'react';
import { School } from '@/data/schoolsData';
import { supabase } from '@/integrations/supabase/client'; 
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

type SortConfig = {
  key: keyof School;
  direction: 'ascending' | 'descending';
};

export const useSchoolsStore = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [regions, setRegions] = useState<{id: string, name: string}[]>([]);
  const [sectors, setSectors] = useState<{id: string, name: string, region_id: string}[]>([]);
  const [isOperationComplete, setIsOperationComplete] = useState<boolean>(false);
  const { user } = useAuth();
  const userRole = user?.role;

  const itemsPerPage = 10;

  // Məktəbləri və digər məlumatları al
  const fetchSchools = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Bütün regionları əldə et
      const { data: regionsData, error: regionsError } = await supabase
        .from('regions')
        .select('id, name')
        .eq('status', 'active')
        .order('name');

      if (regionsError) throw regionsError;

      // Bütün sektorları əldə et
      const { data: sectorsData, error: sectorsError } = await supabase
        .from('sectors')
        .select('id, name, region_id')
        .eq('status', 'active')
        .order('name');

      if (sectorsError) throw sectorsError;

      // Rola görə fərqli sorğular
      let schoolsQuery = supabase.from('schools').select('*').order('name');

      if (userRole === 'regionadmin' && user?.regionId) {
        schoolsQuery = schoolsQuery.eq('region_id', user.regionId);
      } else if (userRole === 'sectoradmin' && user?.sectorId) {
        schoolsQuery = schoolsQuery.eq('sector_id', user.sectorId);
      }

      const { data: schoolsData, error: schoolsError } = await schoolsQuery;

      if (schoolsError) throw schoolsError;

      setRegions(regionsData || []);
      setSectors(sectorsData || []);
      setSchools(schoolsData || []);
    } catch (err) {
      console.error('Məktəblər yüklənərkən xəta baş verdi:', err);
      setError(err as Error);
      toast.error('Məktəblər yüklənərkən xəta baş verdi', {
        description: 'Yenidən cəhd edin və ya sistem administratoru ilə əlaqə saxlayın'
      });
    } finally {
      setLoading(false);
    }
  }, [user?.regionId, user?.sectorId, userRole]);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  // Axtarış və filter əsasında məktəbləri filter et
  const filteredItems = useMemo(() => {
    return schools.filter(school => {
      const matchesSearchTerm = !searchTerm ||
        school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (school.principal_name && school.principal_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (school.admin_email && school.admin_email.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesRegion = !selectedRegion || school.regionId === selectedRegion;
      const matchesSector = !selectedSector || school.sectorId === selectedSector;
      const matchesStatus = !selectedStatus || school.status === selectedStatus;

      return matchesSearchTerm && matchesRegion && matchesSector && matchesStatus;
    });
  }, [schools, searchTerm, selectedRegion, selectedSector, selectedStatus]);

  // Filtredən keçmiş məktəbləri sırala
  const sortedItems = useMemo(() => {
    let sortableItems = [...filteredItems];
    
    if (sortConfig.key) {
      sortableItems.sort((a: School, b: School) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (!aValue && !bValue) return 0;
        if (!aValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        if (!bValue) return sortConfig.direction === 'ascending' ? -1 : 1;

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'ascending'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (aValue === bValue) return 0;
        
        return sortConfig.direction === 'ascending'
          ? (aValue < bValue ? -1 : 1)
          : (aValue < bValue ? 1 : -1);
      });
    }
    
    return sortableItems;
  }, [filteredItems, sortConfig]);

  // Səhifələndirmə
  const totalItems = sortedItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedItems.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedItems, currentPage, itemsPerPage]);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handleRegionFilter = useCallback((value: string) => {
    setSelectedRegion(value);
    // Əgər yeni region seçilibsə, sektor seçimini sıfırla
    if (value !== selectedRegion) {
      setSelectedSector('');
    }
    setCurrentPage(1);
  }, [selectedRegion]);

  const handleSectorFilter = useCallback((value: string) => {
    setSelectedSector(value);
    setCurrentPage(1);
  }, []);

  const handleStatusFilter = useCallback((value: string) => {
    setSelectedStatus(value);
    setCurrentPage(1);
  }, []);

  const handleSort = useCallback((key: keyof School) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
  }, [sortConfig]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedRegion('');
    setSelectedSector('');
    setSelectedStatus('');
    setCurrentPage(1);
  }, []);

  return {
    schools,
    loading,
    error,
    searchTerm,
    selectedRegion,
    selectedSector,
    selectedStatus,
    sortConfig,
    currentPage,
    totalPages,
    currentItems,
    regions,
    sectors,
    userRole,
    isOperationComplete,
    setIsOperationComplete,
    handleSearch,
    handleRegionFilter,
    handleSectorFilter,
    handleStatusFilter,
    handleSort,
    handlePageChange,
    resetFilters,
    fetchSchools
  };
};
