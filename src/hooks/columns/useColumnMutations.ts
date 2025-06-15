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

export const useColumnMutations = (categoryId?: string) => {
  const queryClient = useQueryClient();

  const fixColumnType = (col: any) => ({
    ...col,
    type: col.type as ColumnType, // explicit casting
  });

  const createColumn = useMutation({
    mutationFn: async (columnData: CreateColumnData) => {
      // Ensure options and validation are stored as strings if they're objects
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
      
      const transformed = fixColumnType({
        category_id: data.category_id,
        created_at: data.created_at,
        default_value: data.default_value,
        help_text: data.help_text,
        id: data.id,
        is_required: data.is_required,
        name: data.name,
        options: data.options,
        order_index: data.order_index,
        placeholder: data.placeholder,
        status: data.status,
        type: data.type,
        updated_at: data.updated_at,
        validation: data.validation,
      });
      
      return transformed;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns', categoryId] });
      toast.success('Sütun uğurla yaradıldı');
    },
    onError: (error) => {
      console.error('Error creating column:', error);
      toast.error('Sütun yaradılarkən xəta baş verdi');
    }
  });

  const updateColumn = useMutation({
    mutationFn: async ({ id, ...columnData }: UpdateColumnData & { id: string }) => {
      // Ensure options and validation are stored as strings if they're objects
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
      
      const transformed = fixColumnType({
        category_id: data.category_id,
        created_at: data.created_at,
        default_value: data.default_value,
        help_text: data.help_text,
        id: data.id,
        is_required: data.is_required,
        name: data.name,
        options: data.options,
        order_index: data.order_index,
        placeholder: data.placeholder,
        status: data.status,
        type: data.type,
        updated_at: data.updated_at,
        validation: data.validation,
      });
      
      return transformed;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns', categoryId] });
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
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns', categoryId] });
      toast.success('Sütun uğurla silindi');
    },
    onError: (error) => {
      console.error('Error deleting column:', error);
      toast.error('Sütun silinərkən xəta baş verdi');
    }
  });

  const reorderColumns = useMutation({
    mutationFn: async (columns: { id: string; order_index: number }[]) => {
      // Create an array of updates to be performed
      const updates = columns.map(({ id, order_index }) => ({
        id,
        order_index,
        updated_at: new Date().toISOString()
      }));

      // Use upsert to update multiple rows at once
      const { data, error } = await supabase
        .from('columns')
        .upsert(updates)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns', categoryId] });
      toast.success('Sütunlar uğurla yenidən sıralandı');
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
    reorderColumns: reorderColumns.mutate,
    isCreating: createColumn.isPending,
    isUpdating: updateColumn.isPending,
    isDeleting: deleteColumn.isPending,
    isReordering: reorderColumns.isPending
  };
};

export default useColumnMutations;
