
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Column, ColumnFormData, ColumnType } from '@/types/column';

// Helper function to convert database column to typed Column
const convertDbColumnToColumn = (dbColumn: any): Column => {
  return {
    ...dbColumn,
    type: dbColumn.type as ColumnType,
    description: dbColumn.help_text || '',
    section: '',
    color: ''
  };
};

export const useColumnsQuery = ({ categoryId, enabled = true }: { categoryId?: string; enabled?: boolean }) => {
  const query = useQuery({
    queryKey: ['columns', categoryId],
    queryFn: async () => {
      if (!categoryId) return [];
      
      const { data, error } = await supabase
        .from('columns')
        .select('*')
        .eq('category_id', categoryId)
        .eq('status', 'active')
        .order('order_index');

      if (error) throw error;
      
      // Convert database columns to typed Columns
      return (data || []).map(convertDbColumnToColumn);
    },
    enabled: enabled && !!categoryId
  });

  // Add missing methods for backward compatibility
  return {
    ...query,
    createColumn: async (data: { categoryId: string; columnData: ColumnFormData }) => {
      const mutation = useCreateColumn();
      return mutation.mutateAsync(data);
    },
    updateColumn: async (data: { columnId: string; columnData: Partial<ColumnFormData> }) => {
      const mutation = useUpdateColumn();
      return mutation.mutateAsync(data);
    },
    columns: query.data || []
  };
};

export const useCreateColumn = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ categoryId, columnData }: { categoryId: string; columnData: ColumnFormData }): Promise<Column> => {
      // Convert arrays to JSON strings for database storage
      const dbData = {
        category_id: categoryId,
        name: columnData.name,
        type: columnData.type,
        is_required: columnData.is_required,
        placeholder: columnData.placeholder,
        help_text: columnData.help_text,
        default_value: columnData.default_value,
        order_index: columnData.order_index,
        validation: columnData.validation ? JSON.stringify(columnData.validation) : null,
        options: columnData.options ? JSON.stringify(columnData.options) : null
      };

      const { data, error } = await supabase
        .from('columns')
        .insert(dbData)
        .select()
        .single();

      if (error) throw error;
      return convertDbColumnToColumn(data);
    },
    onSuccess: (_, { categoryId }) => {
      queryClient.invalidateQueries({ queryKey: ['columns', categoryId] });
    }
  });
};

export const useUpdateColumn = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ columnId, columnData }: { columnId: string; columnData: Partial<ColumnFormData> }): Promise<Column> => {
      // Convert arrays to JSON strings for database storage
      const dbData: any = {};
      
      Object.entries(columnData).forEach(([key, value]) => {
        if (key === 'validation' || key === 'options') {
          dbData[key] = value ? JSON.stringify(value) : null;
        } else {
          dbData[key] = value;
        }
      });

      const { data, error } = await supabase
        .from('columns')
        .update(dbData)
        .eq('id', columnId)
        .select()
        .single();

      if (error) throw error;
      return convertDbColumnToColumn(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['columns', data.category_id] });
    }
  });
};

export const useDeleteColumn = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (columnId: string) => {
      const { error } = await supabase
        .from('columns')
        .update({ status: 'deleted' })
        .eq('id', columnId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
    }
  });
};

export const fetchColumnsByCategory = async (categoryId: string): Promise<Column[]> => {
  const { data, error } = await supabase
    .from('columns')
    .select('*')
    .eq('category_id', categoryId)
    .eq('status', 'active')
    .order('order_index');

  if (error) throw error;
  return (data || []).map(convertDbColumnToColumn);
};
