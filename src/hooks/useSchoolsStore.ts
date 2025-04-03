import { create } from 'zustand';
import { useSchoolsData } from './schools/useSchoolsData';
import { useRegionsData } from './regions/useRegionsData';
import { useSectorsData } from './sectors/useSectorsData';
import { SortConfig } from '@/types/sorting';
import { useState, useMemo } from 'react';
import { School } from '@/types/school';
import { Region } from '@/types/region';
import { Sector } from '@/types/sector';

export const useSchoolsStore = () => {
  // Get data from hooks
  const {
    schools,
    isLoading: schoolsLoading,
    fetchSchools: fetchSchoolsData,
    createSchool,
    updateSchool,
    deleteSchool,
  } = useSchoolsData();

  const {
    regions,
    isLoading: regionsLoading,
    fetchRegions,
  } = useRegionsData();

  const {
    sectors,
    isLoading: sectorsLoading,
    fetchSectors,
  } = useSectorsData();

  // State variables
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;
  const [isOperationComplete, setIsOperationComplete] = useState<boolean>(false);

  // Handlers for filters and sorting
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleRegionFilter = (regionId: string) => {
    setSelectedRegion(regionId);
    setSelectedSector('');
    setCurrentPage(1);
  };

  const handleSectorFilter = (sectorId: string) => {
    setSelectedSector(sectorId);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handleSort = (key: string) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedRegion('');
    setSelectedSector('');
    setSelectedStatus('');
    setSortConfig({ key: 'name', direction: 'ascending' });
    setCurrentPage(1);
  };

  // Memoized filtered and sorted items
  const filteredItems = useCallback(() => {
    let filtered = [...schools];

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.address?.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.email?.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.phone?.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    if (selectedRegion) {
      filtered = filtered.filter(item => item.regionId === selectedRegion);
    }

    if (selectedSector) {
      filtered = filtered.filter(item => item.sectorId === selectedSector);
    }

    if (selectedStatus) {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    return filtered;
  }, [schools, searchTerm, selectedRegion, selectedSector, selectedStatus]);

  const sortedItems = useCallback(() => {
    const items = filteredItems();
    if (!sortConfig.key) return items;

    return [...items].sort((a: any, b: any) => {
      const key = sortConfig.key as keyof School;
      const aValue = a[key];
      const bValue = b[key];

      if (aValue === null || aValue === undefined) return -1;
      if (bValue === null || bValue === undefined) return 1;

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
      }

      const aString = String(aValue).toUpperCase();
      const bString = String(bValue).toUpperCase();

      if (aString < bString) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aString > bString) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredItems, sortConfig]);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedItems().slice(startIndex, endIndex);
  }, [sortedItems, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(sortedItems().length / itemsPerPage);
  }, [sortedItems, itemsPerPage]);

  useEffect(() => {
    fetchSchoolsData();
    fetchRegions();
    fetchSectors();
  }, [fetchSchoolsData, fetchRegions, fetchSectors]);

  return {
    schools,
    regions,
    sectors,
    searchTerm,
    selectedRegion,
    selectedSector,
    selectedStatus,
    sortConfig,
    currentPage,
    itemsPerPage,
    totalPages,
    currentItems,
    schoolsLoading,
    regionsLoading,
    sectorsLoading,
    handleSearch,
    handleRegionFilter,
    handleSectorFilter,
    handleStatusFilter,
    handleSort,
    handlePageChange,
    resetFilters,
    fetchSchools: fetchSchoolsData,
    createSchool,
    updateSchool,
    deleteSchool,
    isOperationComplete,
    setIsOperationComplete
  };
};
