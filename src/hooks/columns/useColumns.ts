
import { useState } from 'react';
import { Column } from '@/types/column';
import { useColumnsQuery } from './useColumnsQuery';
import { useColumnFilters } from './useColumnFilters';
import { useColumnMutations } from './useColumnMutations';

export const useColumns = (categoryId?: string) => {
  const {
    data: columns = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useColumnsQuery(categoryId);

  const {
    filters,
    setSearchQuery,
    setCategoryFilter,
    setTypeFilter,
    setStatusFilter,
    applyFilters
  } = useColumnFilters();

  const {
    addColumn,
    updateColumn,
    deleteColumn
  } = useColumnMutations();

  // Filterlənmiş sütunları alırıq
  const filteredColumns = applyFilters(columns);

  return {
    columns,
    filteredColumns,
    isLoading,
    isError,
    error,
    refetch,
    searchQuery: filters.searchQuery,
    setSearchQuery,
    categoryFilter: filters.categoryFilter,
    setCategoryFilter,
    typeFilter: filters.typeFilter,
    setTypeFilter,
    statusFilter: filters.statusFilter,
    setStatusFilter,
    addColumn,
    updateColumn,
    deleteColumn
  };
};
