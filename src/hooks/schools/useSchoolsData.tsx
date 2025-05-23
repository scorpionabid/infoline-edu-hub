import { useState, useCallback, useMemo } from 'react';
import { School, SchoolFormData, mockSchools, mockRegions, mockSectors } from '@/data/schoolsData';
import { toast } from '@/hooks/use-toast';

// Define interfaces for hook return
export interface SortConfig {
  key: string | null;
  direction: 'asc' | 'desc' | null;
}

interface UseSchoolsDataReturn {
  schools: School[];
  searchTerm: string;
  selectedRegion: string;
  selectedSector: string;
  selectedStatus: string;
  filteredSectors: { id: string; regionId: string; name: string; }[];
  sortConfig: SortConfig;
  currentPage: number;
  itemsPerPage: number;
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
  handleAddSchool: (newSchool: School) => void;
  handleUpdateSchool: (updatedSchool: School) => void;
  handleDeleteSchool: (schoolId: string) => void;
  refreshData: () => void;
}

export const useSchoolsData = (): UseSchoolsDataReturn => {
  const [schools, setSchools] = useState<School[]>(mockSchools);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [version, setVersion] = useState(0); // Məlumatların yenilənməsini izləmək üçün
  const itemsPerPage = 5;

  // Məlumatları yeniləmək üçün metod
  const refreshData = useCallback(() => {
    setVersion(prev => prev + 1);
  }, []);

  // Filtered sectors based on selected region
  const filteredSectors = useMemo(() => {
    return selectedRegion 
      ? mockSectors.filter(sector => sector.regionId === selectedRegion) 
      : mockSectors;
  }, [selectedRegion]);

  // Filter schools based on search term and filters
  const filteredSchools = useMemo(() => {
    return schools.filter(school => {
      const searchMatch = 
        school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.principalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.phone.toLowerCase().includes(searchTerm.toLowerCase());

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
        if (a[sortConfig.key as keyof School] < b[sortConfig.key as keyof School]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key as keyof School] > b[sortConfig.key as keyof School]) {
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

  // CRUD operations
  const handleAddSchool = useCallback((newSchool: School) => {
    setSchools(prevSchools => [...prevSchools, newSchool]);
    toast({
      title: "Məktəb uğurla əlavə edildi",
      variant: "default",
    });
    refreshData();
  }, [refreshData]);

  const handleUpdateSchool = useCallback((updatedSchool: School) => {
    setSchools(prevSchools => 
      prevSchools.map(school => 
        school.id === updatedSchool.id ? updatedSchool : school
      )
    );
    toast({
      title: "Məktəb uğurla yeniləndi",
      variant: "default",
    });
    refreshData();
  }, [refreshData]);

  const handleDeleteSchool = useCallback((schoolId: string) => {
    setSchools(prevSchools => prevSchools.filter(school => school.id !== schoolId));
    toast({
      title: "Məktəb uğurla silindi",
      variant: "default",
    });
    refreshData();
  }, [refreshData]);

  return {
    schools,
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
    handleAddSchool,
    handleUpdateSchool,
    handleDeleteSchool,
    refreshData
  };
};

export default useSchoolsData;
