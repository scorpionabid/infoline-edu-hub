
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

  const bulkToggleStatus = useMutation({
    mutationFn: async ({ columnIds, status }: { columnIds: string[], status: 'active' | 'inactive' }) => {
      const { error } = await supabase
        .from('columns')
        .update({ status })
        .in('id', columnIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success('Sütun statusu uğurla dəyişdirildi');
    },
    onError: (error: Error) => {
      toast.error('Sütun statusu dəyişdirilikən xəta baş verdi');
      console.error('Error toggling column status:', error);
    }
  });

  const moveColumnsToCategory = useMutation({
    mutationFn: async ({ columnIds, categoryId }: { columnIds: string[], categoryId: string }) => {
      const { error } = await supabase
        .from('columns')
        .update({ category_id: categoryId })
        .in('id', columnIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success('Sütunlar kateqoriyaya köçürüldü');
    },
    onError: (error: Error) => {
      toast.error('Sütunlar köçürülərkən xəta baş verdi');
      console.error('Error moving columns:', error);
    }
  });

  const bulkDelete = useMutation({
    mutationFn: async (columnIds: string[]) => {
      const { error } = await supabase
        .from('columns')
        .update({ status: 'deleted' })
        .in('id', columnIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success('Sütunlar arxivləşdirildi');
    },
    onError: (error: Error) => {
      toast.error('Sütunlar arxivləşdirilikən xəta baş verdi');
      console.error('Error archiving columns:', error);
    }
  });

  // Add missing duplicate column implementation
  const duplicateColumn = (columnId: string) => {
    console.log('Duplicate column not implemented:', columnId);
  };

  return {
    createColumn: createColumn.mutate,
    updateColumn: updateColumn.mutate,
    deleteColumn: deleteColumn.mutate,
    restoreColumn: restoreColumn.mutate,
    duplicateColumn,
    bulkToggleStatus: bulkToggleStatus.mutate,
    moveColumnsToCategory: moveColumnsToCategory.mutate,
    bulkDelete: bulkDelete.mutate,
    // Add async versions
    createColumnAsync: createColumn.mutateAsync,
    updateColumnAsync: updateColumn.mutateAsync,
    deleteColumnAsync: deleteColumn.mutateAsync,
    restoreColumnAsync: restoreColumn.mutateAsync,
    duplicateColumnAsync: async (columnId: string) => duplicateColumn(columnId),
    bulkToggleStatusAsync: bulkToggleStatus.mutateAsync,
    moveColumnsToCategoryAsync: moveColumnsToCategory.mutateAsync,
    bulkDeleteAsync: bulkDelete.mutateAsync,
    // Add loading states
    isCreating: createColumn.isPending,
    isUpdating: updateColumn.isPending,
    isDeleting: deleteColumn.isPending,
    isRestoring: restoreColumn.isPending,
    isBulkToggling: bulkToggleStatus.isPending,
    isBulkMoving: moveColumnsToCategory.isPending,
    isBulkDeleting: bulkDelete.isPending,
    // Add error states
    createError: createColumn.error,
    updateError: updateColumn.error,
    deleteError: deleteColumn.error
  };
};
