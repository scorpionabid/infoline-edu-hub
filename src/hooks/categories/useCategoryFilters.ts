
import { useState, useCallback } from 'react';
import { CategoryFilter } from '@/types/column';

// CategoryFilter istifadə edən hook
export const useCategoryFilters = (initialFilter: CategoryFilter = {}) => {
  const [filters, setFilters] = useState<CategoryFilter>(initialFilter);

  const updateFilter = useCallback((key: keyof CategoryFilter, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
  }, []);

  return {
    filters,
    updateFilter,
    resetFilters,
    setFilters
  };
};
