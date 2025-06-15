
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Column, ColumnType } from '@/types/column';
import { toast } from 'sonner';

interface CreateColumnData {
  category_id: string;
  name: string;
  type: ColumnType;
  is_required?: boolean;
  order_index?: number;
  placeholder?: string;
  help_text?: string;
  default_value?: string | null;
  options?: any[] | string;
  validation?: any | string;
  status?: 'active' | 'inactive';
}

interface UpdateColumnData {
  name?: string;
  type?: ColumnType;
  is_required?: boolean;
  order_index?: number;
  placeholder?: string;
  help_text?: string;
  default_value?: string | null;
  options?: any[] | string;
  validation?: any | string;
  status?: 'active' | 'inactive';
}

interface BulkOperationParams {
  columnIds: string[];
  status?: 'active' | 'inactive';
  targetCategoryId?: string;
}

export const useColumnMutations = (categoryId?: string) => {
  const queryClient = useQueryClient();

  const fixColumnType = (col: any) => ({
    ...col,
    type: col.type as ColumnType,
  });

  const createColumn = useMutation({
    mutationFn: async (columnData: CreateColumnData) => {
      const dataToInsert = {
        ...columnData,
        options: columnData.options && typeof columnData.options === 'object' 
          ? JSON.stringify(columnData.options) 
          : columnData.options,
        validation: columnData.validation && typeof columnData.validation === 'object'
          ? JSON.stringify(columnData.validation)
          : columnData.validation,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('columns')
        .insert([dataToInsert])
        .select()
        .single();

      if (error) throw error;
      
      return fixColumnType(data);
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
    mutationFn: async ({ id, ...columnData }: UpdateColumnData & { id: string }) => {
      const dataToUpdate = {
        ...columnData,
        options: columnData.options && typeof columnData.options === 'object' 
          ? JSON.stringify(columnData.options) 
          : columnData.options,
        validation: columnData.validation && typeof columnData.validation === 'object'
          ? JSON.stringify(columnData.validation)
          : columnData.validation,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('columns')
        .update(dataToUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      return fixColumnType(data);
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
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('columns')
        .update({ status: 'deleted', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success('Sütun arxivləndi');
    },
    onError: (error) => {
      console.error('Error deleting column:', error);
      toast.error('Sütun silinərkən xəta baş verdi');
    }
  });

  const restoreColumn = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('columns')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return fixColumnType(data);
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
      // Get original column
      const { data: original, error: fetchError } = await supabase
        .from('columns')
        .select('*')
        .eq('id', columnId)
        .single();

      if (fetchError) throw fetchError;

      // Create duplicate
      const duplicateData = {
        ...original,
        id: undefined,
        name: `${original.name} (Kopya)`,
        order_index: (original.order_index || 0) + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('columns')
        .insert([duplicateData])
        .select()
        .single();

      if (error) throw error;
      return fixColumnType(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success('Sütun kopyalandı');
    },
    onError: (error) => {
      console.error('Error duplicating column:', error);
      toast.error('Sütun kopyalanarkən xəta baş verdi');
    }
  });

  const bulkToggleStatus = useMutation({
    mutationFn: async ({ columnIds, status }: BulkOperationParams & { status: 'active' | 'inactive' }) => {
      const { error } = await supabase
        .from('columns')
        .update({ status, updated_at: new Date().toISOString() })
        .in('id', columnIds);

      if (error) throw error;
      return { columnIds, status };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      const statusText = data.status === 'active' ? 'aktivləşdirildi' : 'deaktivləşdirildi';
      toast.success(`${data.columnIds.length} sütun ${statusText}`);
    },
    onError: (error) => {
      console.error('Error bulk toggling status:', error);
      toast.error('Toplu status dəyişikliyi uğursuz oldu');
    }
  });

  const bulkDelete = useMutation({
    mutationFn: async ({ columnIds }: BulkOperationParams) => {
      const { error } = await supabase
        .from('columns')
        .update({ status: 'deleted', updated_at: new Date().toISOString() })
        .in('id', columnIds);

      if (error) throw error;
      return columnIds;
    },
    onSuccess: (columnIds) => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success(`${columnIds.length} sütun arxivləndi`);
    },
    onError: (error) => {
      console.error('Error bulk deleting:', error);
      toast.error('Toplu silmə uğursuz oldu');
    }
  });

  const moveColumnsToCategory = useMutation({
    mutationFn: async ({ columnIds, targetCategoryId }: BulkOperationParams & { targetCategoryId: string }) => {
      const { error } = await supabase
        .from('columns')
        .update({ category_id: targetCategoryId, updated_at: new Date().toISOString() })
        .in('id', columnIds);

      if (error) throw error;
      return { columnIds, targetCategoryId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success(`${data.columnIds.length} sütun kateqoriyaya köçürüldü`);
    },
    onError: (error) => {
      console.error('Error moving columns:', error);
      toast.error('Sütunlar köçürülən zaman xəta baş verdi');
    }
  });

  const reorderColumns = useMutation({
    mutationFn: async (columns: { id: string; order_index: number }[]) => {
      // Update each column individually to avoid upsert issues
      const updatePromises = columns.map(({ id, order_index }) =>
        supabase
          .from('columns')
          .update({ order_index, updated_at: new Date().toISOString() })
          .eq('id', id)
      );

      const results = await Promise.all(updatePromises);
      
      // Check for errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error(`Failed to update ${errors.length} columns`);
      }

      return columns;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success('Sütunlar yenidən sıralandı');
    },
    onError: (error) => {
      console.error('Error reordering columns:', error);
      toast.error('Sütunlar yenidən sıralanarkən xəta baş verdi');
    }
  });

  return {
    createColumn: createColumn.mutate,
    updateColumn: updateColumn.mutate,
    deleteColumn: deleteColumn.mutate,
    restoreColumn: restoreColumn.mutate,
    duplicateColumn: duplicateColumn.mutate,
    bulkToggleStatus: bulkToggleStatus.mutate,
    bulkDelete: bulkDelete.mutate,
    moveColumnsToCategory: moveColumnsToCategory.mutate,
    reorderColumns: reorderColumns.mutate,
    
    // Async versions
    createColumnAsync: createColumn.mutateAsync,
    updateColumnAsync: updateColumn.mutateAsync,
    deleteColumnAsync: deleteColumn.mutateAsync,
    restoreColumnAsync: restoreColumn.mutateAsync,
    duplicateColumnAsync: duplicateColumn.mutateAsync,
    bulkToggleStatusAsync: bulkToggleStatus.mutateAsync,
    bulkDeleteAsync: bulkDelete.mutateAsync,
    moveColumnsToCategoryAsync: moveColumnsToCategory.mutateAsync,
    
    // Loading states
    isCreating: createColumn.isPending,
    isUpdating: updateColumn.isPending,
    isDeleting: deleteColumn.isPending,
    isRestoring: restoreColumn.isPending,
    isReordering: reorderColumns.isPending
  };
};

export default useColumnMutations;
