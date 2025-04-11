
import { useMemo, useState, useCallback } from 'react';
import { School } from '@/data/schoolsData';

export interface SortConfig {
  key: string | null;
  direction: 'asc' | 'desc' | null;
}

interface UseSchoolFiltersProps {
  schools: School[];
  mockSectors: { id: string; regionId: string; name: string; status?: string; description?: string; created_at: string; updated_at: string; }[];
  mockRegions: { id: string; name: string; description?: string; status?: string; created_at: string; updated_at: string; }[];
  version: number;
}

export const useSchoolFilters = ({
  schools,
  mockSectors,
  mockRegions,
  version
}: UseSchoolFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: null });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filtered sectors based on selected region
  const filteredSectors = useMemo(() => {
    return selectedRegion 
      ? mockSectors.filter(sector => sector.regionId === selectedRegion) 
      : mockSectors;
  }, [selectedRegion, mockSectors]);

  // Filter schools based on search term and filters
  const filteredSchools = useMemo(() => {
    return schools.filter(school => {
      const searchMatch = 
        school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.principalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (school.address || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (school.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (school.phone || '').toLowerCase().includes(searchTerm.toLowerCase());

      const regionMatch = selectedRegion ? school.regionId === selectedRegion : true;
      const sectorMatch = selectedSector ? school.sectorId === selectedSector : true;
      const statusMatch = selectedStatus ? school.status === selectedStatus : true;
      
      return searchMatch && regionMatch && sectorMatch && statusMatch;
    });
  }, [schools, searchTerm, selectedRegion, selectedSector, selectedStatus, version]);

  // Sort schools based on sort config
  const sortedSchools = useMemo(() => {
    const sortableSchools = [...filteredSchools];
    if (sortConfig.key) {
      sortableSchools.sort((a, b) => {
        // @ts-ignore - Dynamic key access
        const aValue = a[sortConfig.key as keyof School];
        // @ts-ignore - Dynamic key access
        const bValue = b[sortConfig.key as keyof School];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableSchools;
  }, [filteredSchools, sortConfig]);

  // Pagination
  const totalPages = useMemo(() => {
    return Math.ceil(sortedSchools.length / itemsPerPage);
  }, [sortedSchools.length, itemsPerPage]);

  // Səhifə sayı dəyişəndə cari səhifə nömrəsini yenidən hesablayaq
  const adjustedCurrentPage = Math.min(currentPage, Math.max(1, totalPages));
  const indexOfLastItem = adjustedCurrentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  
  const currentItems = useMemo(() => {
    return sortedSchools.slice(indexOfFirstItem, indexOfLastItem);
  }, [sortedSchools, indexOfFirstItem, indexOfLastItem, version]);

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

  return {
    searchTerm,
    selectedRegion,
    selectedSector,
    selectedStatus,
    filteredSectors,
    sortConfig,
    currentPage: adjustedCurrentPage,
    itemsPerPage,
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
    resetFilters,
    mockRegions
  };
};
