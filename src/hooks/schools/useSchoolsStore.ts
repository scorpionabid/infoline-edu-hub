
import { create } from 'zustand';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useSchoolsData } from './useSchoolsData';
import { useRegionsData } from './../regions/useRegionsData';
import { useSectorsData } from './../sectors/useSectorsData';
import { SortConfig } from '@/types/sorting';
import { School } from '@/types/school';
import { Region } from '@/types/region';
import { Sector } from '@/types/sector';

interface SchoolsState {
  searchTerm: string;
  selectedRegion: string;
  selectedSector: string;
  selectedStatus: string;
  sortConfig: SortConfig | null;
  currentPage: number;
  itemsPerPage: number;
  sectors: Sector[];
  regions: Region[];
  handleSearch: (term: string) => void;
  handleRegionFilter: (regionId: string) => void;
  handleSectorFilter: (sectorId: string) => void;
  handleStatusFilter: (status: string) => void;
  handleSort: (key: string) => void;
  handlePageChange: (page: number) => void;
  resetFilters: () => void;
}

export const useSchoolsStore = () => {
  const { schools, loading: schoolsLoading, error: schoolsError, fetchSchools } = useSchoolsData();
  const { regions, loading: regionsLoading, error: regionsError, fetchRegions } = useRegionsData();
  const { sectors, loading: sectorsLoading, error: sectorsError, fetchSectors } = useSectorsData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isOperationComplete, setIsOperationComplete] = useState(false);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);

  const handleRegionFilter = useCallback((regionId: string) => {
    setSelectedRegion(regionId);
    setSelectedSector('');
    setCurrentPage(1);
  }, []);

  const handleSectorFilter = useCallback((sectorId: string) => {
    setSelectedSector(sectorId);
    setCurrentPage(1);
  }, []);

  const handleStatusFilter = useCallback((status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  }, []);

  const handleSort = useCallback((key: string) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction } as SortConfig);
  }, [sortConfig]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedRegion('');
    setSelectedSector('');
    setSelectedStatus('');
    setSortConfig(null);
    setCurrentPage(1);
  }, []);

  const sortedItems = useMemo(() => {
    if (!schools || schools.length === 0 || !sortConfig) return schools;

    return [...schools].sort((a, b) => {
      const key = sortConfig.key;
      const direction = sortConfig.direction === 'ascending' ? 1 : -1;

      if (key === 'name') {
        return a.name.localeCompare(b.name) * direction;
      }
      
      if (key === 'region') {
        const regionA = a.regionName || '';
        const regionB = b.regionName || '';
        return regionA.localeCompare(regionB) * direction;
      }
      
      if (key === 'sector') {
        const sectorA = a.sectorName || '';
        const sectorB = b.sectorName || '';
        return sectorA.localeCompare(sectorB) * direction;
      }

      return 0;
    });
  }, [schools, sortConfig]);

  const filteredItems = useMemo(() => {
    let result = sortedItems;

    if (searchTerm) {
      result = result?.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRegion) {
      result = result?.filter(item => item.regionId === selectedRegion || item.region_id === selectedRegion);
    }

    if (selectedSector) {
      result = result?.filter(item => item.sectorId === selectedSector || item.sector_id === selectedSector);
    }

    if (selectedStatus) {
      result = result?.filter(item => item.status === selectedStatus);
    }

    return result || [];
  }, [sortedItems, searchTerm, selectedRegion, selectedSector, selectedStatus]);

  const totalPages = useMemo(() => {
    return Math.ceil((filteredItems?.length || 0) / itemsPerPage);
  }, [filteredItems, itemsPerPage]);

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredItems?.slice(start, end) || [];
  }, [filteredItems, currentPage, itemsPerPage]);

  useEffect(() => {
    fetchSchools();
    fetchRegions();
    fetchSectors();
  }, [fetchSchools, fetchRegions, fetchSectors]);

  return {
    schools,
    searchTerm,
    selectedRegion,
    selectedSector,
    selectedStatus,
    sortConfig,
    currentPage,
    itemsPerPage,
    totalPages,
    currentItems,
    sectors,
    regions,
    handleSearch,
    handleRegionFilter,
    handleSectorFilter,
    handleStatusFilter,
    handleSort,
    handlePageChange,
    resetFilters,
    fetchSchools,
    fetchRegions,
    fetchSectors,
    isOperationComplete,
    setIsOperationComplete,
    isLoading: schoolsLoading || regionsLoading || sectorsLoading,
    error: schoolsError || regionsError || sectorsError
  };
};
