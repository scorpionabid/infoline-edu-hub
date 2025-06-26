import { useState, useCallback, useMemo } from 'react';
import { School } from '@/types/supabase';

interface UseSchoolFiltersReturn {
  searchTerm: string;
  regionFilter: string;
  sectorFilter: string;
  statusFilter: string;
  setSearchTerm: (term: string) => void;
  setRegionFilter: (regionId: string) => void;
  setSectorFilter: (sectorId: string) => void;
  setStatusFilter: (status: string) => void;
  filteredSchools: School[];
  resetFilters: () => void;
  filterSchools: (
    schools: School[],
    searchTerm: string,
    regionFilter: string,
    sectorFilter: string,
    statusFilter: string
  ) => School[];
}

export const useSchoolFilters = (schools: School[] = []): UseSchoolFiltersReturn => {
  // Filter state-ləri
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Filtrləmə funksiyası
  const filterSchools = useCallback(
    (
      schools: School[],
      searchTerm: string,
      regionFilter: string,
      sectorFilter: string,
      statusFilter: string
    ): School[] => {
      if (!schools || !Array.isArray(schools)) {
        console.error('filterSchools: schools is not an array', schools);
        return [];
      }
      
      return schools.filter(school => {
        const searchMatch = searchTerm
          ? school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (school.principal_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
          : true;

        const regionMatch = regionFilter === 'all' || school.region_id === regionFilter;
        const sectorMatch = sectorFilter === 'all' || school.sector_id === sectorFilter;
        const statusMatch = statusFilter === 'all' || school.status === statusFilter;

        return searchMatch && regionMatch && sectorMatch && statusMatch;
      });
    },
    []
  );
  
  // Filtrlənmiş məktəblər
  const filteredSchools = useMemo(() => {
    return filterSchools(schools, searchTerm, regionFilter, sectorFilter, statusFilter);
  }, [schools, searchTerm, regionFilter, sectorFilter, statusFilter, filterSchools]);
  
  // Filtrləri sıfırlamaq
  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setRegionFilter('all');
    setSectorFilter('all');
    setStatusFilter('all');
  }, []);
  
  return {
    searchTerm,
    regionFilter,
    sectorFilter,
    statusFilter,
    setSearchTerm,
    setRegionFilter,
    setSectorFilter,
    setStatusFilter,
    filteredSchools,
    resetFilters,
    // filterSchools
  };
};
