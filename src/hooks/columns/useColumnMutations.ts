
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Column, ColumnFormData } from '@/types/column';
import { toast } from 'sonner';

export const useColumnMutations = () => {
  const queryClient = useQueryClient();

  const createColumn = useMutation({
    mutationFn: async ({ categoryId, data }: { categoryId: string; data: ColumnFormData }): Promise<Column> => {
      // Get the highest order_index for this category
      const { data: existingColumns, error: fetchError } = await supabase
        .from('columns')
        .select('order_index')
        .eq('category_id', categoryId)
        .order('order_index', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      const orderIndex = existingColumns && existingColumns.length > 0 
        ? (existingColumns[0].order_index || 0) + 1 
        : 0;

      const insertData = {
        ...data,
        category_id: categoryId,
        status: 'active',
        order_index: orderIndex,
        default_value: data.default_value ? String(data.default_value) : undefined,
        options: data.options ? JSON.stringify(data.options) : undefined,
        validation: data.validation ? JSON.stringify(data.validation) : undefined,
      };

      const { data: result, error } = await supabase
        .from('columns')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success('Sütun uğurla yaradıldı');
    },
    onError: (error) => {
      console.error('Error creating column:', error);
      toast.error('Sütun yaradılarkən xəta baş verdi');
    }
  });

  const updateColumn = useMutation({
    mutationFn: async ({ columnId, data }: { columnId: string; data: Partial<ColumnFormData> }): Promise<Column> => {
      const updateData = {
        ...data,
        updated_at: new Date().toISOString(),
        default_value: data.default_value !== undefined ? String(data.default_value) : undefined,
        options: data.options ? JSON.stringify(data.options) : undefined,
        validation: data.validation ? JSON.stringify(data.validation) : undefined,
      };

      const { data: result, error } = await supabase
        .from('columns')
        .update(updateData)
        .eq('id', columnId)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success('Sütun uğurla yeniləndi');
    },
    onError: (error) => {
      console.error('Error updating column:', error);
      toast.error('Sütun yenilənərkən xəta baş verdi');
    }
  });

  const deleteColumn = useMutation({
    mutationFn: async ({ columnId, permanent = false }: { columnId: string; permanent?: boolean }): Promise<void> => {
      if (permanent) {
        // First delete related data entries to avoid foreign key constraint
        const { error: dataDeleteError } = await supabase
          .from('data_entries')
          .delete()
          .eq('column_id', columnId);

        if (dataDeleteError) {
          console.warn('Warning deleting data entries:', dataDeleteError);
        }

        // Then permanently delete the column
        const { error } = await supabase
          .from('columns')
          .delete()
          .eq('id', columnId);

        if (error) throw error;
      } else {
        // Soft delete - mark as deleted
        const { error } = await supabase
          .from('columns')
          .update({ status: 'deleted', updated_at: new Date().toISOString() })
          .eq('id', columnId);

        if (error) throw error;
      }
    },
    onSuccess: (_, { permanent }) => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success(permanent ? 'Sütun tamamilə silindi' : 'Sütun arxivə köçürüldü');
    },
    onError: (error) => {
      console.error('Error deleting column:', error);
      toast.error('Sütun silinərkən xəta baş verdi');
    }
  });

  const restoreColumn = useMutation({
    mutationFn: async (columnId: string): Promise<Column> => {
      const { data: result, error } = await supabase
        .from('columns')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .eq('id', columnId)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success('Sütun bərpa edildi');
    },
    onError: (error) => {
      console.error('Error restoring column:', error);
      toast.error('Sütun bərpa edilərkən xəta baş verdi');
    }
  });

  const duplicateColumn = useMutation({
    mutationFn: async ({ columnId }: { columnId: string }) => {
      const { data: originalColumn, error: fetchError } = await supabase
        .from('columns')
        .select('*')
        .eq('id', columnId)
        .single();

      if (fetchError) throw fetchError;

      const duplicatedColumn = {
        ...originalColumn,
        id: undefined,
        name: `${originalColumn.name} (Kopya)`,
        created_at: undefined,
        updated_at: undefined,
      };

      const { data, error } = await supabase
        .from('columns')
        .insert([duplicatedColumn])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success('Sütun uğurla kopyalandı');
    },
    onError: (error) => {
      console.error('Duplicate column error:', error);
      toast.error('Sütun kopyalama xətası');
    }
  });

  const bulkToggleStatus = useMutation({
    mutationFn: async ({ columnIds, status }: { columnIds: string[], status: 'active' | 'inactive' }) => {
      const { data, error } = await supabase
        .from('columns')
        .update({ status, updated_at: new Date().toISOString() })
        .in('id', columnIds)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success(`Sütunlar ${status === 'active' ? 'aktivləşdirildi' : 'deaktivləşdirildi'}`);
    },
    onError: (error) => {
      console.error('Bulk toggle status error:', error);
      toast.error('Status dəyişdirmə xətası');
    }
  });

  const moveColumnsToCategory = useMutation({
    mutationFn: async ({ columnIds, targetCategoryId }: { columnIds: string[], targetCategoryId: string }) => {
      const { data, error } = await supabase
        .from('columns')
        .update({ category_id: targetCategoryId, updated_at: new Date().toISOString() })
        .in('id', columnIds)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success('Sütunlar başqa kateqoriyaya köçürüldü');
    },
    onError: (error) => {
      console.error('Move columns error:', error);
      toast.error('Sütun köçürmə xətası');
    }
  });

  const bulkDelete = useMutation({
    mutationFn: async ({ columnIds }: { columnIds: string[] }) => {
      const { data, error } = await supabase
        .from('columns')
        .update({ status: 'deleted', updated_at: new Date().toISOString() })
        .in('id', columnIds)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success('Seçilmiş sütunlar silindi');
    },
    onError: (error) => {
      console.error('Bulk delete error:', error);
      toast.error('Toplu silmə xətası');
    }
  });

  return {
    // Mutation functions
    createColumn: createColumn.mutate,
    updateColumn: updateColumn.mutate,
    deleteColumn: deleteColumn.mutate,
    restoreColumn: restoreColumn.mutate,
    duplicateColumn: duplicateColumn.mutate,
    bulkToggleStatus: bulkToggleStatus.mutate,
    moveColumnsToCategory: moveColumnsToCategory.mutate,
    bulkDelete: bulkDelete.mutate,
    
    // Async mutation functions
    createColumnAsync: createColumn.mutateAsync,
    updateColumnAsync: updateColumn.mutateAsync,
    deleteColumnAsync: deleteColumn.mutateAsync,
    restoreColumnAsync: restoreColumn.mutateAsync,
    duplicateColumnAsync: duplicateColumn.mutateAsync,
    bulkToggleStatusAsync: bulkToggleStatus.mutateAsync,
    moveColumnsToCategoryAsync: moveColumnsToCategory.mutateAsync,
    bulkDeleteAsync: bulkDelete.mutateAsync,
    
    // Loading states
    isCreating: createColumn.isPending,
    isUpdating: updateColumn.isPending,
    isDeleting: deleteColumn.isPending,
    isRestoring: restoreColumn.isPending,
    isBulkDeleting: bulkDelete.isPending,
    
    // Error states
    createError: createColumn.error,
    updateError: updateColumn.error,
    deleteError: deleteColumn.error,
  };
};
