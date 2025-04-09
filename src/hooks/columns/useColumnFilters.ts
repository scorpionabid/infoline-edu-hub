
import { useState, useCallback } from 'react';
import { Column } from '@/types/column';

export interface ColumnFilters {
  searchQuery: string;
  categoryFilter: string | null;
  typeFilter: string;
  statusFilter: string;
}

export const useColumnFilters = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const applyFilters = useCallback((columns: Column[]): Column[] => {
    return columns.filter(column => {
      // Search filter
      if (searchQuery && !column.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Category filter
      if (categoryFilter && column.category_id !== categoryFilter) {
        return false;
      }
      
      // Type filter
      if (typeFilter && typeFilter !== 'all' && column.type !== typeFilter) {
        return false;
      }
      
      // Status filter
      if (statusFilter && statusFilter !== 'all' && column.status !== statusFilter) {
        return false;
      }
      
      return true;
    });
  }, [searchQuery, categoryFilter, typeFilter, statusFilter]);

  return {
    filters: {
      searchQuery,
      categoryFilter,
      typeFilter,
      statusFilter
    },
    setSearchQuery,
    setCategoryFilter,
    setTypeFilter,
    setStatusFilter,
    applyFilters
  };
};
