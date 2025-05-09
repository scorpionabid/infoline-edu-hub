
import { useState, useCallback } from 'react';
import { CategoryFilter } from '@/types/category';

// Default filters
const defaultFilters: CategoryFilter = {
  search: '',
  status: '',
  assignment: '',
  date: undefined
};

export const useCategoryFilters = () => {
  const [filters, setFilters] = useState<CategoryFilter>(defaultFilters);
  
  // Update a specific filter
  const updateFilter = useCallback((key: keyof CategoryFilter, value: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);
  
  // Update search filter
  const updateSearch = useCallback((value: string) => {
    updateFilter('search', value);
  }, [updateFilter]);
  
  // Update status filter
  const updateStatus = useCallback((value: string) => {
    updateFilter('status', value);
  }, [updateFilter]);
  
  // Update assignment filter
  const updateAssignment = useCallback((value: string) => {
    updateFilter('assignment', value);
  }, [updateFilter]);
  
  // Update date filter
  const updateDate = useCallback((value: string | undefined) => {
    updateFilter('date', value);
  }, [updateFilter]);
  
  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);
  
  // Apply filters to a list of categories
  const applyFilters = useCallback((categories: any[]) => {
    return categories.filter(category => {
      // Apply search filter
      if (filters.search && !category.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      // Apply status filter
      if (filters.status && category.status !== filters.status) {
        return false;
      }
      
      // Apply assignment filter
      if (filters.assignment && category.assignment !== filters.assignment) {
        return false;
      }
      
      // Apply date filter (if implemented)
      if (filters.date && category.deadline) {
        // Implement date filtering logic here
      }
      
      return true;
    });
  }, [filters]);
  
  return {
    filters,
    updateFilter,
    updateSearch,
    updateStatus,
    updateAssignment,
    updateDate,
    resetFilters,
    applyFilters
  };
};
