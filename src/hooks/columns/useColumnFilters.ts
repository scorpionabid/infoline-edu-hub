
import { useState, useCallback } from 'react';
import { Column } from '@/types/column';

interface ColumnFilters {
  searchQuery: string;
  categoryFilter: string | undefined;
  typeFilter: string | undefined;
  statusFilter: 'active' | 'inactive' | undefined;
}

export const useColumnFilters = () => {
  const [filters, setFilters] = useState<ColumnFilters>({
    searchQuery: '',
    categoryFilter: undefined,
    typeFilter: undefined,
    statusFilter: undefined
  });

  const setSearchQuery = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const setCategoryFilter = useCallback((categoryId?: string) => {
    setFilters(prev => ({ ...prev, categoryFilter: categoryId }));
  }, []);

  const setTypeFilter = useCallback((type?: string) => {
    setFilters(prev => ({ ...prev, typeFilter: type }));
  }, []);

  const setStatusFilter = useCallback((status?: 'active' | 'inactive') => {
    setFilters(prev => ({ ...prev, statusFilter: status }));
  }, []);

  const applyFilters = useCallback((columns: Column[]) => {
    return columns.filter(column => {
      // Axtarış sorğusu
      if (filters.searchQuery && 
          !column.name.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
        return false;
      }

      // Kateqoriya filtri
      if (filters.categoryFilter && column.category_id !== filters.categoryFilter) {
        return false;
      }

      // Tip filtri
      if (filters.typeFilter && column.type !== filters.typeFilter) {
        return false;
      }

      // Status filtri
      if (filters.statusFilter && column.status !== filters.statusFilter) {
        return false;
      }

      return true;
    });
  }, [filters]);

  return {
    filters,
    setSearchQuery,
    setCategoryFilter,
    setTypeFilter,
    setStatusFilter,
    applyFilters
  };
};
