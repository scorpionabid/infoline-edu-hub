
import { useState, useCallback, useMemo } from 'react';
import { School } from '@/types/supabase';
import { usePermissions } from '@/services/permissions/usePermissions';

export interface SortConfig {
  key: string | null;
  direction: 'asc' | 'desc' | null;
}

interface UseSchoolsFiltersProps {
  schools: School[];
  sectorId?: string;
  regionId?: string;
}

interface UseSchoolsFiltersReturn {
  searchTerm: string;
  selectedRegion: string;
  selectedSector: string;
  selectedStatus: string;
  sortConfig: SortConfig;
  currentPage: number;
  filteredSchools: School[];
  sortedSchools: School[];
  currentItems: School[];
  totalPages: number;
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRegionFilter: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleSectorFilter: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleStatusFilter: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleSort: (key: string) => void;
  handlePageChange: (page: number) => void;
  resetFilters: () => void;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

/**
 * Məktəb filtrlərini idarə edən hook
 */
export const useSchoolsFilters = ({
  schools,
  sectorId,
  regionId
}: UseSchoolsFiltersProps): UseSchoolsFiltersReturn => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState(regionId || '');
  const [selectedSector, setSelectedSector] = useState(sectorId || '');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: null });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { userRole } = usePermissions();

  // Istifadəçi roluna görə filtr dəyərlərini təyin etmək
  useEffect(() => {
    if (userRole === 'regionadmin' && regionId) {
      setSelectedRegion(regionId);
    } else if (userRole === 'sectoradmin' && sectorId) {
      setSelectedSector(sectorId);
      
      // Sektorun aid olduğu regionu təyin etmək
      const sector = schools.find(s => s.sector_id === sectorId);
      if (sector && sector.region_id) {
        setSelectedRegion(sector.region_id);
      }
    }
  }, [userRole, sectorId, regionId, schools]);

  // Filtrlənmiş məktəblər
  const filteredSchools = useMemo(() => {
    return schools.filter(school => {
      const searchMatch = 
        school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (school.principal_name && school.principal_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (school.address && school.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (school.email && school.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (school.phone && school.phone.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const regionMatch = !selectedRegion || school.region_id === selectedRegion;
      const sectorMatch = !selectedSector || school.sector_id === selectedSector;
      const statusMatch = !selectedStatus || school.status === selectedStatus;
      
      return searchMatch && regionMatch && sectorMatch && statusMatch;
    });
  }, [schools, searchTerm, selectedRegion, selectedSector, selectedStatus]);

  // Sıralanmış məktəblər
  const sortedSchools = useMemo(() => {
    return [...filteredSchools].sort((a, b) => {
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
  }, [filteredSchools, sortConfig]);

  // Paginated məktəblər
  const totalPages = Math.ceil(sortedSchools.length / itemsPerPage);
  const adjustedCurrentPage = Math.min(currentPage, Math.max(1, totalPages));
  const indexOfLastItem = adjustedCurrentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedSchools.slice(indexOfFirstItem, indexOfLastItem);

  // Event handlers
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleRegionFilter = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRegion(e.target.value);
    setSelectedSector('');  // Region dəyişdikdə sektor seçimini sıfırlayırıq
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
    
    // Sektoradmin üçün sektorId və regionId qalır
    if (userRole !== 'sectoradmin') {
      setSelectedRegion('');
      setSelectedSector('');
    }
    
    setSelectedStatus('');
    setCurrentPage(1);
  }, [userRole]);

  return {
    searchTerm,
    selectedRegion,
    selectedSector,
    selectedStatus,
    sortConfig,
    currentPage: adjustedCurrentPage,
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
    setCurrentPage
  };
};
