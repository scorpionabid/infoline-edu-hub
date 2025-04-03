import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { School } from '@/types/supabase';
import { useRegionsData } from '../useRegions';
import { useSectorsData } from '../useSectors';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

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
  const [isOperationComplete, setIsOperationComplete] = useState(false);
  const itemsPerPage = 10;
  const { t } = useLanguage();
  
  const { regions } = useRegionsData();
  const { sectors, loading: sectorsLoading } = useSectorsData(selectedRegion);

  const fetchSchools = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from('schools').select('*');
      
      if (selectedRegion) {
        query = query.eq('region_id', selectedRegion);
      }
      
      if (selectedSector) {
        query = query.eq('sector_id', selectedSector);
      }
      
      if (selectedStatus) {
        query = query.eq('status', selectedStatus);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setSchools(data as School[]);
    } catch (err: any) {
      console.error('Error fetching schools:', err);
      setError(err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotLoadSchools')
      });
    } finally {
      setLoading(false);
    }
  }, [selectedRegion, selectedSector, selectedStatus, t]);

  const filteredSchools = schools.filter(school => {
    const searchMatch = 
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (school.principal_name && school.principal_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (school.address && school.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (school.email && school.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (school.phone && school.phone.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return searchMatch;
  });

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

  const totalPages = Math.ceil(sortedSchools.length / itemsPerPage);
  const adjustedCurrentPage = Math.min(currentPage, Math.max(1, totalPages));
  const indexOfLastItem = adjustedCurrentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedSchools.slice(indexOfFirstItem, indexOfLastItem);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleRegionFilter = useCallback((value: string) => {
    setSelectedRegion(value === 'all' ? '' : value);
    setSelectedSector('');
    setCurrentPage(1);
  }, []);

  const handleSectorFilter = useCallback((value: string) => {
    setSelectedSector(value === 'all' ? '' : value);
    setCurrentPage(1);
  }, []);

  const handleStatusFilter = useCallback((value: string) => {
    setSelectedStatus(value === 'all' ? '' : value);
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
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedRegion('');
    setSelectedSector('');
    setSelectedStatus('');
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  return {
    schools,
    loading,
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
    totalPages,
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
    fetchSchools,
    setSchools,
    isOperationComplete,
    setIsOperationComplete
  };
};
