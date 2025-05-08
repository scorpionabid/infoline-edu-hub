
import { useState, useCallback } from 'react';
import { CategoryFilter } from '@/types/column';

export const useCategoryFilters = (initialFilters: CategoryFilter = {}) => {
  const [filters, setFilters] = useState<CategoryFilter>(initialFilters);

  const updateFilter = useCallback((key: keyof CategoryFilter, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
  }, []);

  return {
    filters,
    updateFilter,
    resetFilters
  };
};

export default useCategoryFilters;
