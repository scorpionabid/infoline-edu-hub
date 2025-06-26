import { useState, useCallback } from 'react';
import { useDebounce } from '@/hooks/common/useDebounce';

export interface FilterState {
  selectedRegion: string;
  selectedSector: string;
  selectedCategory: string;
  searchQuery: string;
}

export const useSchoolColumnFilters = () => {
  const [filters, setFilters] = useState<FilterState>({
    selectedRegion: 'all',
    selectedSector: 'all',
    selectedCategory: 'all',
    searchQuery: ''
  });

  // Debounced search query
  const debouncedSearchQuery = useDebounce(filters.searchQuery, 500);

  const updateFilter = useCallback(<K extends keyof FilterState>(
    key: K, 
    value: FilterState[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      selectedRegion: 'all',
      selectedSector: 'all',
      selectedCategory: 'all',
      searchQuery: ''
    });
  }, []);

  return {
    filters,
    debouncedSearchQuery,
    updateFilter,
    // resetFilters
  };
};
