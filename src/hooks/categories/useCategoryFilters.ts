
import { useState, useCallback } from 'react';
import { CategoryAssignment, CategoryFilter, CategoryStatus } from '@/types/category';
import useDebounce from '@/hooks/common/useDebounce';

export const useCategoryFilters = () => {
  const [filters, setFilters] = useState<CategoryFilter>({
    search: '',
    status: '' as CategoryStatus | '',
    assignment: '' as CategoryAssignment | ''
  });
  
  const debouncedSearch = useDebounce(filters.search, 300);

  const updateSearchFilter = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search }));
  }, []);

  const updateStatusFilter = useCallback((status: CategoryStatus | '') => {
    setFilters(prev => ({ ...prev, status }));
  }, []);

  const updateAssignmentFilter = useCallback((assignment: CategoryAssignment | '') => {
    setFilters(prev => ({ ...prev, assignment }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      status: '' as CategoryStatus | '',
      assignment: '' as CategoryAssignment | ''
    });
  }, []);

  return {
    filters,
    debouncedSearch,
    updateSearchFilter,
    updateStatusFilter,
    updateAssignmentFilter,
    // clearFilters
  };
};

export default useCategoryFilters;
