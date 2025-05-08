
import { useState, useCallback } from 'react';
import { CategoryFilter } from '@/types/column';

export const useCategoryFilters = (initialFilters: CategoryFilter = {}) => {
  const [filters, setFilters] = useState<CategoryFilter>(initialFilters);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [date, setDate] = useState<string | null>(null);

  const updateFilter = useCallback((key: keyof CategoryFilter, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
    setSearchQuery('');
    setDate(null);
  }, []);

  const handleFilterChange = useCallback((key: string, value: string) => {
    updateFilter(key as keyof CategoryFilter, value);
  }, [updateFilter]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    updateFilter('search', value);
  }, [updateFilter]);

  const handleDateChange = useCallback((value: string | null) => {
    setDate(value);
    updateFilter('date', value);
  }, [updateFilter]);

  return {
    filters,
    updateFilter,
    resetFilters,
    searchQuery,
    handleSearchChange,
    date,
    handleDateChange,
    handleFilterChange
  };
};

export default useCategoryFilters;
