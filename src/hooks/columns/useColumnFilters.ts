
import { useState, useCallback } from 'react';
import { Column } from '@/types/column';

interface ColumnFilters {
  searchQuery: string;
  categoryFilter: string;
  typeFilter: string;
  statusFilter: string;
}

export const useColumnFilters = () => {
  const [filters, setFilters] = useState<ColumnFilters>({
    searchQuery: '',
    categoryFilter: 'all',
    typeFilter: 'all',
    statusFilter: 'all'
  });
  
  // Axtarış sorğusunu yeniləmə
  const setSearchQuery = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }));
  }, []);
  
  // Kateqoriya filtrini yeniləmə
  const setCategoryFilter = useCallback((category: string) => {
    setFilters(prev => ({ ...prev, categoryFilter: category }));
  }, []);
  
  // Tip filtrini yeniləmə
  const setTypeFilter = useCallback((type: string) => {
    setFilters(prev => ({ ...prev, typeFilter: type }));
  }, []);
  
  // Status filtrini yeniləmə
  const setStatusFilter = useCallback((status: string) => {
    setFilters(prev => ({ ...prev, statusFilter: status }));
  }, []);
  
  // Bütün filtrləri sıfırlama
  const resetFilters = useCallback(() => {
    setFilters({
      searchQuery: '',
      categoryFilter: 'all',
      typeFilter: 'all',
      statusFilter: 'all'
    });
  }, []);
  
  // Sütunları filtrlər əsasında filtrinləmə
  const applyFilters = useCallback((columns: Column[]) => {
    return columns.filter(column => {
      const nameMatch = filters.searchQuery 
        ? column.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) 
        : true;
      
      const categoryMatch = filters.categoryFilter === 'all' || column.category_id === filters.categoryFilter;
      const typeMatch = filters.typeFilter === 'all' || column.type === filters.typeFilter;
      const statusMatch = filters.statusFilter === 'all' || column.status === filters.statusFilter;
      
      return nameMatch && categoryMatch && typeMatch && statusMatch;
    });
  }, [filters]);
  
  return {
    filters,
    setSearchQuery,
    setCategoryFilter,
    setTypeFilter,
    setStatusFilter,
    resetFilters,
    // applyFilters
  };
};
