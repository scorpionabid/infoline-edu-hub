
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
  return useQuery({
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
};

export const useCreateColumn = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (categoryId: string, columnData: ColumnFormData): Promise<Column> => {
      const { data, error } = await supabase
        .from('columns')
        .insert({
          category_id: categoryId,
          ...columnData
        })
        .select()
        .single();

      if (error) throw error;
      return convertDbColumnToColumn(data);
    },
    onSuccess: (_, categoryId) => {
      queryClient.invalidateQueries({ queryKey: ['columns', categoryId] });
    }
  });
};

export const useUpdateColumn = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (columnId: string, columnData: Partial<ColumnFormData>): Promise<Column> => {
      const { data, error } = await supabase
        .from('columns')
        .update(columnData)
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
