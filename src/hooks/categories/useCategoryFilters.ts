
import { useState, useCallback } from 'react';
import { CategoryFilter } from '@/types/category';

// Extend CategoryFilter with date property
interface ExtendedCategoryFilter extends CategoryFilter {
  date?: 'upcoming' | 'past' | 'all' | '';
}

export const useCategoryFilters = (initialFilter: ExtendedCategoryFilter = {}) => {
  const [filter, setFilter] = useState<ExtendedCategoryFilter>({
    search: '',
    status: '',
    assignment: '',
    sortBy: 'name',
    sortOrder: 'asc',
    archived: false,
    date: '',
    ...initialFilter
  });

  /**
   * Update a single filter property
   */
  const updateFilter = useCallback(<K extends keyof ExtendedCategoryFilter>(
    key: K, 
    value: ExtendedCategoryFilter[K]
  ) => {
    setFilter(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  /**
   * Update multiple filter properties at once
   */
  const updateFilters = useCallback((updates: Partial<ExtendedCategoryFilter>) => {
    setFilter(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  /**
   * Reset filters to defaults or specified values
   */
  const resetFilters = useCallback((defaults: Partial<ExtendedCategoryFilter> = {}) => {
    setFilter({
      search: '',
      status: '',
      assignment: '',
      sortBy: 'name',
      sortOrder: 'asc',
      archived: false,
      date: '',
      ...defaults
    });
  }, []);

  /**
   * Toggle sort order for a specific column
   */
  const toggleSort = useCallback((column: string) => {
    setFilter(prev => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  /**
   * Helper to get current sort direction for a column
   */
  const getSortDirection = useCallback((column: string) => {
    return filter.sortBy === column ? filter.sortOrder : null;
  }, [filter.sortBy, filter.sortOrder]);

  return {
    filter,
    updateFilter,
    updateFilters,
    resetFilters,
    toggleSort,
    getSortDirection
  };
};
