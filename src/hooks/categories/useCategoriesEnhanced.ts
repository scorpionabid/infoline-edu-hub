
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Category, CategoryFilter } from '@/types/category';
import apiClient from '@/lib/api-client';
import logger from '@/lib/logger';

/**
 * Enhanced hook for fetching categories with better caching and error handling
 */
export const useCategoriesEnhanced = (initialFilter?: CategoryFilter) => {
  const [filter, setFilter] = useState<CategoryFilter>(initialFilter || {
    search: '',
    status: ['active'],
    archived: false,
    sortBy: 'name',
    sortOrder: 'asc'
  });
  
  // Fetch categories with React Query
  const {
    data: categories,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['categories', filter],
    queryFn: async () => {
      logger.debug('Fetching categories with filter', { 
        context: 'useCategoriesEnhanced',
        data: { filter } 
      });
      
      // Start with the base query
      let query = supabase
        .from('categories')
        .select('*');
      
      // Apply filters
      if (filter.search) {
        query = query.ilike('name', `%${filter.search}%`);
      }
      
      if (filter.status && filter.status.length > 0) {
        query = query.in('status', filter.status);
      }
      
      // Handle archived filter
      if (filter.archived !== undefined) {
        query = query.eq('archived', filter.archived);
      }
      
      // Apply sorting
      if (filter.sortBy) {
        query = query.order(filter.sortBy, {
          ascending: filter.sortOrder === 'asc'
        });
      }
      
      // Execute the query with our enhanced client
      const result = await apiClient.fetch<Category[]>('categories', query, {
        tags: ['categories']
      });
      
      if (result.error) {
        throw result.error;
      }
      
      return result.data || [];
    },
    refetchOnWindowFocus: false
  });
  
  // Function to update filter
  const updateFilter = (newFilter: Partial<CategoryFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  };
  
  return {
    categories,
    isLoading,
    isError,
    error,
    filter,
    updateFilter,
    refetch
  };
};

export default useCategoriesEnhanced;
