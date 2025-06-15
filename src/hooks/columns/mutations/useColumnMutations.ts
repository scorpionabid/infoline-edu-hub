
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Column, ColumnFormData, ColumnType, parseColumnOptions, parseValidationRules } from '@/types/column';
import { toast } from 'sonner';

// Helper to safely convert database record to Column
const convertToColumn = (item: any): Column => {
  return {
    id: item.id,
    name: item.name,
    type: item.type as ColumnType,
    category_id: item.category_id,
    placeholder: item.placeholder,
    help_text: item.help_text,
    description: item.description,
    is_required: item.is_required || false,
    default_value: item.default_value,
    options: parseColumnOptions(item.options),
    validation: parseValidationRules(item.validation),
    order_index: item.order_index || 0,
    status: item.status || 'active',
    created_at: item.created_at,
    updated_at: item.updated_at,
    section: item.section
  };
};

export const useColumnMutations = () => {
  const queryClient = useQueryClient();

  const createColumn = useMutation({
    mutationFn: async (data: ColumnFormData): Promise<Column> => {
      // Prepare data for database with proper JSON serialization
      const insertData = {
        name: data.name,
        type: data.type,
        category_id: data.category_id,
        placeholder: data.placeholder,
        help_text: data.help_text,
        description: data.description,
        is_required: data.is_required,
        default_value: data.default_value,
        options: data.options ? JSON.stringify(data.options) : null,
        validation: data.validation ? JSON.stringify(data.validation) : null,
        order_index: data.order_index,
        section: data.section,
        status: data.status || 'active'
      };

      const { data: result, error } = await supabase
        .from('columns')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;
      
      return convertToColumn(result);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ['columns']
      });
      queryClient.invalidateQueries({ 
        queryKey: ['active-columns']
      });
      toast.success('Sütun uğurla yaradıldı');
    },
    onError: (error) => {
      console.error('Error creating column:', error);
      toast.error('Sütun yaradılarkən xəta baş verdi');
    }
  });

  const updateColumn = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ColumnFormData> }): Promise<Column> => {
      // Prepare data for database with proper JSON serialization
      const updateData: any = {
        ...data,
        updated_at: new Date().toISOString()
      };

      // Handle JSON fields
      if (data.options !== undefined) {
        updateData.options = data.options ? JSON.stringify(data.options) : null;
      }
      if (data.validation !== undefined) {
        updateData.validation = data.validation ? JSON.stringify(data.validation) : null;
      }

      const { data: result, error } = await supabase
        .from('columns')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      return convertToColumn(result);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ['columns']
      });
      queryClient.invalidateQueries({ 
        queryKey: ['column', data.id]
      });
      toast.success('Sütun uğurla yeniləndi');
    },
    onError: (error) => {
      console.error('Error updating column:', error);
      toast.error('Sütun yenilənərkən xəta baş verdi');
    }
  });

  const deleteColumn = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('columns')
        .update({ status: 'archived', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['columns']
      });
      queryClient.invalidateQueries({ 
        queryKey: ['active-columns']
      });
      toast.success('Sütun arxivləndi');
    },
    onError: (error) => {
      console.error('Error archiving column:', error);
      toast.error('Sütun arxivlənərkən xəta baş verdi');
    }
  });

  return {
    createColumn,
    updateColumn,
    deleteColumn
  };
};
