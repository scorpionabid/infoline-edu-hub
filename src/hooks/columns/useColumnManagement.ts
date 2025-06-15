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
    createColumnAsync,
    updateColumnAsync,
    deleteColumnAsync,
    restoreColumnAsync,
    isCreating,
    isUpdating,
    isDeleting,
    isRestoring
  } = useColumnMutations();

  // Enhanced operations
  const duplicateColumn = useCallback(async (column: Column): Promise<boolean> => {
    try {
      const duplicatedData: ColumnFormData = {
        name: `${column.name} (Kopya)`,
        type: column.type,
        category_id: column.category_id,
        placeholder: column.placeholder,
        help_text: column.help_text,
        is_required: column.is_required,
        default_value: column.default_value,
        options: column.options,
        validation: column.validation,
        order_index: column.order_index + 1,
        status: 'active'
      };

      await createColumnAsync({
        categoryId: column.category_id,
        data: duplicatedData
      });

      toast.success('Sütun kopyalandı');
      return true;
    } catch (error) {
      console.error('Duplicate column error:', error);
      toast.error('Sütun kopyalanarkən xəta baş verdi');
      return false;
    }
  }, [createColumnAsync]);

  const bulkToggleStatus = useCallback(async (
    columnIds: string[], 
    status: 'active' | 'inactive'
  ): Promise<boolean> => {
    try {
      const updatePromises = columnIds.map(columnId => 
        updateColumnAsync({
          columnId,
          data: { status }
        })
      );

      await Promise.all(updatePromises);
      
      const statusText = status === 'active' ? 'aktivləşdirildi' : 'deaktivləşdirildi';
      toast.success(`${columnIds.length} sütun ${statusText}`);
      return true;
    } catch (error) {
      console.error('Bulk status toggle error:', error);
      toast.error('Toplu status dəyişikliyi uğursuz oldu');
      return false;
    }
  }, [updateColumnAsync]);

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
    duplicateColumn,
    bulkToggleStatus,
    
    // Selection management
    toggleColumnSelection,
    selectAllColumns,
    clearSelection,
    isColumnSelected,
  };
};

export default useColumnManagement;
