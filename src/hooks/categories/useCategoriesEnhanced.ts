
import { useState, useEffect, useMemo } from 'react';
import { Category, CategoryFilter } from '@/types/category';
import { useCategoriesQuery } from './useCategoriesQuery';
import { useDebounce } from '../common/useDebounce';

/**
 * Enhanced hook for categories that includes filtering and pagination
 */
export const useCategoriesEnhanced = (initialFilters: CategoryFilter = { search: '', status: '', assignment: '' }) => {
  const [filters, setFilters] = useState<CategoryFilter>(initialFilters);
  const debouncedSearchTerm = useDebounce(filters.search, 300);
  const { data: allCategories, isLoading, error, refetch } = useCategoriesQuery();
  
  // Apply filters to categories
  const filteredCategories = useMemo(() => {
    if (!allCategories) return [];
    
    return allCategories.filter(category => {
      // Text search
      if (debouncedSearchTerm && !category.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) {
        return false;
      }
      
      // Status filter
      if (filters.status && category.status !== filters.status) {
        return false;
      }
      
      // Assignment filter
      if (filters.assignment && category.assignment !== filters.assignment) {
        return false;
      }
      
      return true;
    });
  }, [allCategories, debouncedSearchTerm, filters.status, filters.assignment]);
  
  const updateFilters = (newFilters: Partial<CategoryFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters(initialFilters);
  };
  
  return {
    categories: filteredCategories,
    allCategories,
    filters,
    updateFilters,
    resetFilters,
    isLoading,
    error,
    refetch,
  };
};

export default useCategoriesEnhanced;
