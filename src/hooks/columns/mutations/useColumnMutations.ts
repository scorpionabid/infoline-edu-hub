import { useMutation, useQueryClient } from '@tanstack/react-query';
import { columnService } from '@/services/columns/columnService';
import { ColumnFormData } from '@/types/column';

/**
 * Unified Column Mutations Hook
 * Replaces useColumnMutations, useColumns mutation functions
 */
export const useColumnMutations = () => {
  const queryClient = useQueryClient();

  // Helper function to invalidate related queries
  const invalidateColumnQueries = (categoryId?: string) => {
    if (categoryId) {
      // Invalidate specific category queries
      queryClient.invalidateQueries(['columns', { categoryId }]);
    } else {
      // Invalidate all column queries
      queryClient.invalidateQueries(['columns']);
    }
  };

  // Create column mutation
  const createColumn = useMutation({
    mutationFn: ({ categoryId, data }: { categoryId: string; data: ColumnFormData }) =>
      columnService.createColumn(categoryId, data),
    onSuccess: (result, variables) => {
      invalidateColumnQueries(variables.categoryId);
    },
    onError: (error) => {
      console.error('Create column mutation error:', error);
    },
  });

  // Update column mutation
  const updateColumn = useMutation({
    mutationFn: ({ columnId, data }: { columnId: string; data: Partial<ColumnFormData> }) =>
      columnService.updateColumn(columnId, data),
    onSuccess: (result) => {
      // Invalidate queries for the updated column's category
      invalidateColumnQueries(result.category_id);
    },
    onError: (error) => {
      console.error('Update column mutation error:', error);
    },
  });

  // Delete column mutation (soft delete)
  const deleteColumn = useMutation({
    mutationFn: ({ columnId, permanent = false }: { columnId: string; permanent?: boolean }) =>
      columnService.deleteColumn(columnId, permanent),
    onSuccess: (_, variables) => {
      // Invalidate all column queries since we don't know the category
      invalidateColumnQueries();
    },
    onError: (error) => {
      console.error('Delete column mutation error:', error);
    },
  });

  // Restore column mutation
  const restoreColumn = useMutation({
    mutationFn: (columnId: string) => columnService.restoreColumn(columnId),
    onSuccess: (result) => {
      invalidateColumnQueries(result.category_id);
    },
    onError: (error) => {
      console.error('Restore column mutation error:', error);
    },
  });

  // Bulk delete mutation
  const bulkDelete = useMutation({
    mutationFn: ({ columnIds, permanent = false }: { columnIds: string[]; permanent?: boolean }) =>
      columnService.bulkDelete(columnIds, permanent),
    onSuccess: () => {
      // Invalidate all column queries
      invalidateColumnQueries();
    },
    onError: (error) => {
      console.error('Bulk delete mutation error:', error);
    },
  });

  // Reorder columns mutation
  const reorderColumns = useMutation({
    mutationFn: (columnIds: string[]) => columnService.reorderColumns(columnIds),
    onSuccess: () => {
      // Invalidate all column queries to reflect new order
      invalidateColumnQueries();
    },
    onError: (error) => {
      console.error('Reorder columns mutation error:', error);
    },
  });

  // Duplicate column mutation
  const duplicateColumn = useMutation({
    mutationFn: ({ columnId, newName }: { columnId: string; newName?: string }) =>
      columnService.duplicateColumn(columnId, newName),
    onSuccess: (result) => {
      invalidateColumnQueries(result.category_id);
    },
    onError: (error) => {
      console.error('Duplicate column mutation error:', error);
    },
  });

  // Bulk toggle status mutation
  const bulkToggleStatus = useMutation({
    mutationFn: ({ columnIds, status }: { columnIds: string[]; status: 'active' | 'inactive' }) =>
      columnService.bulkToggleStatus(columnIds, status),
    onSuccess: () => {
      invalidateColumnQueries();
    },
    onError: (error) => {
      console.error('Bulk toggle status mutation error:', error);
    },
  });

  // Move columns to category mutation
  const moveColumnsToCategory = useMutation({
    mutationFn: ({ columnIds, targetCategoryId }: { columnIds: string[]; targetCategoryId: string }) =>
      columnService.moveColumnsToCategory(columnIds, targetCategoryId),
    onSuccess: () => {
      invalidateColumnQueries();
    },
    onError: (error) => {
      console.error('Move columns to category mutation error:', error);
    },
  });

  return {
    // Mutation functions
    createColumn: createColumn.mutate,
    updateColumn: updateColumn.mutate,
    deleteColumn: deleteColumn.mutate,
    restoreColumn: restoreColumn.mutate,
    bulkDelete: bulkDelete.mutate,
    reorderColumns: reorderColumns.mutate,
    duplicateColumn: duplicateColumn.mutate,
    bulkToggleStatus: bulkToggleStatus.mutate,
    moveColumnsToCategory: moveColumnsToCategory.mutate,

    // Async versions
    createColumnAsync: createColumn.mutateAsync,
    updateColumnAsync: updateColumn.mutateAsync,
    deleteColumnAsync: deleteColumn.mutateAsync,
    restoreColumnAsync: restoreColumn.mutateAsync,
    bulkDeleteAsync: bulkDelete.mutateAsync,
    reorderColumnsAsync: reorderColumns.mutateAsync,
    duplicateColumnAsync: duplicateColumn.mutateAsync,
    bulkToggleStatusAsync: bulkToggleStatus.mutateAsync,
    moveColumnsToCategoryAsync: moveColumnsToCategory.mutateAsync,

    // Loading states
    isCreating: createColumn.isPending,
    isUpdating: updateColumn.isPending,
    isDeleting: deleteColumn.isPending,
    isRestoring: restoreColumn.isPending,
    isBulkDeleting: bulkDelete.isPending,
    isReordering: reorderColumns.isPending,
    isDuplicating: duplicateColumn.isPending,
    isBulkToggling: bulkToggleStatus.isPending,
    isMovingCategory: moveColumnsToCategory.isPending,

    // General loading state
    isLoading: createColumn.isPending || 
               updateColumn.isPending || 
               deleteColumn.isPending || 
               restoreColumn.isPending || 
               bulkDelete.isPending || 
               reorderColumns.isPending ||
               duplicateColumn.isPending ||
               bulkToggleStatus.isPending ||
               moveColumnsToCategory.isPending,

    // Error states
    createError: createColumn.error,
    updateError: updateColumn.error,
    deleteError: deleteColumn.error,
    restoreError: restoreColumn.error,
    bulkDeleteError: bulkDelete.error,
    reorderError: reorderColumns.error,
    duplicateError: duplicateColumn.error,
    bulkToggleError: bulkToggleStatus.error,
    moveCategoryError: moveColumnsToCategory.error,

    // Reset functions
    resetCreateError: createColumn.reset,
    resetUpdateError: updateColumn.reset,
    resetDeleteError: deleteColumn.reset,
    resetRestoreError: restoreColumn.reset,
    resetBulkDeleteError: bulkDelete.reset,
    resetReorderError: reorderColumns.reset,
    resetDuplicateError: duplicateColumn.reset,
    resetBulkToggleError: bulkToggleStatus.reset,
    resetMoveCategoryError: moveColumnsToCategory.reset,
  };
};

export default useColumnMutations;
