
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Column, ColumnFormData } from '@/types/column';

export const useColumnMutations = () => {
  const queryClient = useQueryClient();

  const createColumn = useMutation({
    mutationFn: async (columnData: Omit<Column, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('columns')
        .insert([columnData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success('Sütun uğurla yaradıldı');
    },
    onError: (error: Error) => {
      toast.error('Sütun yaradılarkən xəta baş verdi');
      console.error('Error creating column:', error);
    }
  });

  const updateColumn = useMutation({
    mutationFn: async ({ id, ...columnData }: Partial<Column> & { id: string }) => {
      const { data, error } = await supabase
        .from('columns')
        .update(columnData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success('Sütun uğurla yeniləndi');
    },
    onError: (error: Error) => {
      toast.error('Sütun yenilənərkən xəta baş verdi');
      console.error('Error updating column:', error);
    }
  });

  const deleteColumn = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('columns')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success('Sütun uğurla silindi');
    },
    onError: (error: Error) => {
      toast.error('Sütun silinərkən xəta baş verdi');
      console.error('Error deleting column:', error);
    }
  });

  const restoreColumn = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('columns')
        .update({ status: 'active' })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success('Sütun bərpa edildi');
    },
    onError: (error: Error) => {
      toast.error('Sütun bərpa edilərkən xəta baş verdi');
      console.error('Error restoring column:', error);
    }
  });

  // Add missing bulk operations
  const duplicateColumn = (columnId: string) => {
    console.log('Duplicate column not implemented:', columnId);
  };

  const bulkToggleStatus = (columnIds: string[], status: 'active' | 'inactive') => {
    console.log('Bulk toggle status not implemented:', columnIds, status);
  };

  const moveColumnsToCategory = (columnIds: string[], categoryId: string) => {
    console.log('Move columns to category not implemented:', columnIds, categoryId);
  };

  const bulkDelete = (columnIds: string[]) => {
    console.log('Bulk delete not implemented:', columnIds);
  };

  return {
    createColumn: createColumn.mutate,
    updateColumn: updateColumn.mutate,
    deleteColumn: deleteColumn.mutate,
    restoreColumn: restoreColumn.mutate,
    duplicateColumn,
    bulkToggleStatus,
    moveColumnsToCategory,
    bulkDelete,
    // Add async versions
    createColumnAsync: createColumn.mutateAsync,
    updateColumnAsync: updateColumn.mutateAsync,
    deleteColumnAsync: deleteColumn.mutateAsync,
    restoreColumnAsync: restoreColumn.mutateAsync,
    duplicateColumnAsync: async (columnId: string) => duplicateColumn(columnId),
    bulkToggleStatusAsync: async (columnIds: string[], status: 'active' | 'inactive') => bulkToggleStatus(columnIds, status),
    moveColumnsToCategoryAsync: async (columnIds: string[], categoryId: string) => moveColumnsToCategory(columnIds, categoryId),
    bulkDeleteAsync: async (columnIds: string[]) => bulkDelete(columnIds),
    // Add loading states
    isCreating: createColumn.isPending,
    isUpdating: updateColumn.isPending,
    isDeleting: deleteColumn.isPending,
    isRestoring: restoreColumn.isPending,
    // Add error states
    createError: createColumn.error,
    updateError: updateColumn.error,
    deleteError: deleteColumn.error
  };
};
