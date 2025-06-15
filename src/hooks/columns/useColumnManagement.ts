
import { useState, useCallback } from 'react';
import { useColumnsQuery, useColumnMutations } from './index';
import { Column, ColumnFormData } from '@/types/column';
import { toast } from 'sonner';

/**
 * Enhanced Column Management Hook
 * Consolidates all column operations with advanced functionality
 */
export const useColumnManagement = (categoryId?: string) => {
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  // Core queries and mutations
  const { 
    data: columns = [], 
    isLoading, 
    error, 
    refetch 
  } = useColumnsQuery({ 
    enabled: true
  });

  const {
    createColumn,
    updateColumn,
    deleteColumn,
    restoreColumn,
    duplicateColumn,
    bulkToggleStatus,
    bulkDelete,
    moveColumnsToCategory,
    createColumnAsync,
    updateColumnAsync,
    deleteColumnAsync,
    restoreColumnAsync,
    duplicateColumnAsync,
    bulkToggleStatusAsync,
    bulkDeleteAsync,
    moveColumnsToCategoryAsync,
    isCreating,
    isUpdating,
    isDeleting,
    isRestoring
  } = useColumnMutations();

  // Enhanced operations
  const duplicateColumnEnhanced = useCallback(async (column: Column): Promise<boolean> => {
    try {
      await duplicateColumnAsync({ columnId: column.id });
      toast.success('Sütun kopyalandı');
      return true;
    } catch (error) {
      console.error('Duplicate column error:', error);
      toast.error('Sütun kopyalanarkən xəta baş verdi');
      return false;
    }
  }, [duplicateColumnAsync]);

  const bulkToggleStatusEnhanced = useCallback(async (
    columnIds: string[], 
    status: 'active' | 'inactive'
  ): Promise<boolean> => {
    try {
      await bulkToggleStatusAsync({ columnIds, status });
      
      const statusText = status === 'active' ? 'aktivləşdirildi' : 'deaktivləşdirildi';
      toast.success(`${columnIds.length} sütun ${statusText}`);
      return true;
    } catch (error) {
      console.error('Bulk status toggle error:', error);
      toast.error('Toplu status dəyişikliyi uğursuz oldu');
      return false;
    }
  }, [bulkToggleStatusAsync]);

  // Selection management
  const toggleColumnSelection = useCallback((columnId: string) => {
    setSelectedColumns(prev => 
      prev.includes(columnId)
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    );
  }, []);

  const selectAllColumns = useCallback((columns: Column[]) => {
    setSelectedColumns(columns.map(col => col.id));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedColumns([]);
  }, []);

  const isColumnSelected = useCallback((columnId: string) => {
    return selectedColumns.includes(columnId);
  }, [selectedColumns]);

  // Computed values
  const activeColumns = columns.filter(col => col.status === 'active');
  const archivedColumns = columns.filter(col => col.status === 'deleted');
  const selectedColumnsData = columns.filter(col => selectedColumns.includes(col.id));

  const stats = {
    total: columns.length,
    active: activeColumns.length,
    archived: archivedColumns.length,
    selected: selectedColumns.length
  };

  return {
    // Data
    columns,
    activeColumns,
    archivedColumns,
    selectedColumns,
    selectedColumnsData,
    stats,
    
    // Loading states
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isRestoring,
    error,
    
    // Basic operations
    createColumn,
    updateColumn,
    deleteColumn,
    restoreColumn,
    refetch,
    
    // Async operations
    createColumnAsync,
    updateColumnAsync,
    deleteColumnAsync,
    restoreColumnAsync,
    
    // Enhanced operations
    duplicateColumn: duplicateColumnEnhanced,
    bulkToggleStatus: bulkToggleStatusEnhanced,
    
    // Selection management
    toggleColumnSelection,
    selectAllColumns,
    clearSelection,
    isColumnSelected,
  };
};

export default useColumnManagement;
