
import { useState, useCallback } from 'react';
import { useDebounce } from '@/hooks/common/useDebounce';
import { CategoryStatus } from '@/types/category';

interface CategoryFilter {
  status: CategoryStatus | '';
  search: string;
  assignment: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export const useCategoryFilters = () => {
  const [filters, setFilters] = useState<CategoryFilter>({
    status: '' as (CategoryStatus | ''),
    search: '',
    assignment: '',
    sortBy: 'updated_at',
    sortOrder: 'desc'
  });

  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Debounce the search filter to prevent excessive queries
  const debouncedSetSearch = useDebounce((value: string) => {
    setDebouncedSearch(value);
    setFilters(prev => ({ ...prev, search: value }));
  }, 300);

  const handleSearchChange = useCallback((value: string) => {
    debouncedSetSearch(value);
  }, [debouncedSetSearch]);

  const handleStatusChange = useCallback((value: string) => {
    setFilters(prev => ({ 
      ...prev, 
      status: value as (CategoryStatus | '')
    }));
  }, []);

  const handleAssignmentChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, assignment: value }));
  }, []);

  const handleSortChange = useCallback((field: string) => {
    setFilters(prev => {
      if (prev.sortBy === field) {
        // Toggle sort order
        return { ...prev, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' };
      }
      // New sort field, default to ascending
      return { ...prev, sortBy: field, sortOrder: 'asc' };
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      status: '' as (CategoryStatus | ''),
      search: '',
      assignment: '',
      sortBy: 'updated_at',
      sortOrder: 'desc'
    });
    setDebouncedSearch('');
  }, []);

  // Calculate if any filters are active
  const hasActiveFilters = filters.status !== '' || 
    filters.assignment !== '' || 
    filters.search !== '';

  return {
    filters,
    debouncedSearch,
    handleSearchChange,
    handleStatusChange,
    handleAssignmentChange,
    handleSortChange,
    resetFilters,
    hasActiveFilters
  };
};

export default useCategoryFilters;
