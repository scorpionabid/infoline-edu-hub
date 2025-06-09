import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Column, ColumnFormData } from '@/types/column';
import { toast } from 'sonner';

export const useColumnMutations = () => {
  const queryClient = useQueryClient();

  const createColumn = useMutation({
    mutationFn: async (columnData: Omit<Column, 'id'> & { id?: string }) => {
      console.log('Creating column with data:', columnData);
      
      // Prepare data for database insertion
      const dbData = {
        category_id: columnData.category_id,
        name: columnData.name,
        type: columnData.type,
        is_required: columnData.is_required || false,
        placeholder: columnData.placeholder || '',
        help_text: columnData.help_text || '',
        default_value: columnData.default_value || '',
        order_index: columnData.order_index || 0,
        validation: columnData.validation ? JSON.stringify(columnData.validation) : null,
        options: columnData.options ? JSON.stringify(columnData.options) : null,
        status: 'active'
      };

      const { data, error } = await supabase
        .from('columns')
        .insert([dbData])
        .select()
        .single();

      if (error) {
        console.error('Database error creating column:', error);
        throw new Error(error.message);
      }

      console.log('Column created successfully:', data);
      return { success: true, data };
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      queryClient.invalidateQueries({ queryKey: ['columns', variables.category_id] });
      toast.success('Sütun uğurla yaradıldı');
    },
    onError: (error: Error) => {
      console.error('Error creating column:', error);
      toast.error('Sütun yaradılarkən xəta baş verdi: ' + error.message);
    }
  });

  const updateColumn = useMutation({
    mutationFn: async (columnData: Column) => {
      console.log('Updating column with data:', columnData);
      
      // Prepare data for database update
      const dbData = {
        name: columnData.name,
        type: columnData.type,
        is_required: columnData.is_required || false,
        placeholder: columnData.placeholder || '',
        help_text: columnData.help_text || '',
        default_value: columnData.default_value || '',
        order_index: columnData.order_index || 0,
        validation: columnData.validation ? JSON.stringify(columnData.validation) : null,
        options: columnData.options ? JSON.stringify(columnData.options) : null
      };

      const { data, error } = await supabase
        .from('columns')
        .update(dbData)
        .eq('id', columnData.id)
        .select()
        .single();

      if (error) {
        console.error('Database error updating column:', error);
        throw new Error(error.message);
      }

      console.log('Column updated successfully:', data);
      return { success: true, data };
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      queryClient.invalidateQueries({ queryKey: ['columns', variables.category_id] });
      toast.success('Sütun uğurla yeniləndi');
    },
    onError: (error: Error) => {
      console.error('Error updating column:', error);
      toast.error('Sütun yenilənərkən xəta baş verdi: ' + error.message);
    }
  });

  const deleteColumn = useMutation({
    mutationFn: async (columnId: string) => {
      console.log('Deleting column with ID:', columnId);
      
      const { error } = await supabase
        .from('columns')
        .update({ status: 'deleted' })
        .eq('id', columnId);

      if (error) {
        console.error('Database error deleting column:', error);
        throw new Error(error.message);
      }

      console.log('Column deleted successfully');
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success('Sütun uğurla silindi');
    },
    onError: (error: Error) => {
      console.error('Error deleting column:', error);
      toast.error('Sütun silinərkən xəta baş verdi: ' + error.message);
    }
  });

  // Restore column mutation
  const restoreColumn = useMutation({
    mutationFn: async (columnId: string) => {
      console.log('🔄 Restoring column with ID:', columnId);
      
      const { data, error } = await supabase
        .from('columns')
        .update({ status: 'active' })
        .eq('id', columnId)
        .select()
        .single();

      if (error) {
        console.error('❌ Database error restoring column:', error);
        throw new Error(error.message);
      }

      console.log('✅ Column restored successfully:', data);
      return { success: true, data };
    },
    onSuccess: (result, columnId) => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success('Sütun uğurla bərpa edildi');
    },
    onError: (error: Error) => {
      console.error('❌ Error restoring column:', error);
      toast.error('Sütun bərpa edilərkən xəta baş verdi: ' + error.message);
    }
  });

  // Permanent delete column mutation
  const permanentDeleteColumn = useMutation({
    mutationFn: async (columnId: string) => {
      console.log('🗑️ Permanently deleting column with ID:', columnId);
      
      // First, delete related data entries
      const { error: dataEntriesError } = await supabase
        .from('data_entries')
        .delete()
        .eq('column_id', columnId);

      if (dataEntriesError) {
        console.error('❌ Error deleting data entries:', dataEntriesError);
        throw new Error('Failed to delete related data entries: ' + dataEntriesError.message);
      }

      // Delete related sector data entries
      const { error: sectorEntriesError } = await supabase
        .from('sector_data_entries')
        .delete()
        .eq('column_id', columnId);

      if (sectorEntriesError) {
        console.error('❌ Error deleting sector entries:', sectorEntriesError);
        throw new Error('Failed to delete related sector entries: ' + sectorEntriesError.message);
      }

      // Finally, delete the column
      const { error: columnError } = await supabase
        .from('columns')
        .delete()
        .eq('id', columnId);

      if (columnError) {
        console.error('❌ Database error deleting column:', columnError);
        throw new Error(columnError.message);
      }

      console.log('✅ Column permanently deleted successfully');
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success('Sütun tamamilə silindi');
    },
    onError: (error: Error) => {
      console.error('❌ Error permanently deleting column:', error);
      toast.error('Sütun silinərkən xəta baş verdi: ' + error.message);
    }
  });

  return {
    createColumn: (data: Omit<Column, 'id'> & { id?: string }) => {
      console.log('CreateColumn function called with:', data);
      return createColumn.mutateAsync(data);
    },
    updateColumn: (data: Column) => {
      console.log('UpdateColumn function called with:', data);
      return updateColumn.mutateAsync(data);
    },
    deleteColumn: (id: string) => {
      console.log('DeleteColumn function called with ID:', id);
      return deleteColumn.mutateAsync(id);
    },
    restoreColumn: (id: string) => {
      console.log('RestoreColumn function called with ID:', id);
      return restoreColumn.mutateAsync(id);
    },
    permanentDeleteColumn: (id: string) => {
      console.log('PermanentDeleteColumn function called with ID:', id);
      return permanentDeleteColumn.mutateAsync(id);
    },
    isCreating: createColumn.isPending,
    isUpdating: updateColumn.isPending,
    isDeleting: deleteColumn.isPending,
    isRestoring: restoreColumn.isPending,
    isPermanentDeleting: permanentDeleteColumn.isPending
  };
};