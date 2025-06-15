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
  const [isReordering, setIsReordering] = useState(false);

  // Core queries and mutations
  const { 
    data: columns = [], 
    isLoading, 
    error, 
    refetch 
  } = useColumnsQuery({ 
    categoryId,
    includeDeleted: true 
  });

  const {
    createColumn,
    updateColumn,
    deleteColumn,
    restoreColumn,
    bulkDelete,
    reorderColumns,
    createColumnAsync,
    updateColumnAsync,
    deleteColumnAsync,
    restoreColumnAsync,
    bulkDeleteAsync,
    reorderColumnsAsync,
    isCreating,
    isUpdating,
    isDeleting,
    isRestoring,
    isBulkDeleting,
    isReordering: isMutationReordering
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

  const moveColumnsToCategory = useCallback(async (
    columnIds: string[], 
    targetCategoryId: string
  ): Promise<boolean> => {
    try {
      const updatePromises = columnIds.map(columnId => 
        updateColumnAsync({
          columnId,
          data: { category_id: targetCategoryId }
        })
      );

      await Promise.all(updatePromises);
      
      toast.success(`${columnIds.length} sütun yeni kateqoriyaya köçürüldü`);
      return true;
    } catch (error) {
      console.error('Move columns error:', error);
      toast.error('Sütunların köçürülməsi uğursuz oldu');
      return false;
    }
  }, [updateColumnAsync]);

  const handleDragAndDropReorder = useCallback(async (
    reorderedColumns: Column[]
  ): Promise<boolean> => {
    setIsReordering(true);
    try {
      const columnIds = reorderedColumns.map(col => col.id);
      await reorderColumnsAsync(columnIds);
      
      toast.success('Sütun sırası yeniləndi');
      return true;
    } catch (error) {
      console.error('Drag and drop reorder error:', error);
      toast.error('Sıralama dəyişikliyi uğursuz oldu');
      return false;
    } finally {
      setIsReordering(false);
    }
  }, [reorderColumnsAsync]);

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
    isBulkDeleting,
    isReordering: isReordering || isMutationReordering,
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
    moveColumnsToCategory,
    handleDragAndDropReorder,
    
    // Bulk operations
    bulkDelete,
    bulkDeleteAsync,
    
    // Selection management
    toggleColumnSelection,
    selectAllColumns,
    clearSelection,
    isColumnSelected,
  };
};

export default useColumnManagement;
