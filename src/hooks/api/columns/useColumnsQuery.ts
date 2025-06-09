
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Column, ColumnFormValues, ColumnType, ColumnOption } from '@/types/column';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { transformRawColumnData } from '@/utils/columnOptionsParser';

// Helper function to convert database column to typed Column
const convertDbColumnToColumn = (dbColumn: any): Column => {
  return {
    ...dbColumn,
    type: dbColumn.type as ColumnType,
    options: dbColumn.options ? (typeof dbColumn.options === 'string' ? JSON.parse(dbColumn.options) : dbColumn.options) : [],
    validation: dbColumn.validation ? (typeof dbColumn.validation === 'string' ? JSON.parse(dbColumn.validation) : dbColumn.validation) : {},
    status: dbColumn.status as 'active' | 'inactive',
    created_at: dbColumn.created_at,
    updated_at: dbColumn.updated_at
  };
};

export const useColumnsQuery = ({ categoryId, enabled = true }: { categoryId?: string; enabled?: boolean } = {}) => {
  const query = useQuery({
    queryKey: ['columns', categoryId],
    queryFn: async (): Promise<Column[]> => {
      console.log('📊 useColumnsQuery - Fetching columns for categoryId:', categoryId);
      
      let queryBuilder = supabase
        .from('columns')
        .select('*')
        .order('order_index');

      // Only filter by category if categoryId is provided
      if (categoryId) {
        queryBuilder = queryBuilder.eq('category_id', categoryId);
      }

      const { data, error } = await queryBuilder;

      if (error) {
        console.error('❌ Error fetching columns:', error);
        throw error;
      }
      
      console.log('📊 useColumnsQuery - Raw data from Supabase:', data);
      
      // Convert database columns to typed Columns
      const transformedColumns = (data || []).map(item => {
        const baseColumn = convertDbColumnToColumn(item);
        const transformed = {
          ...baseColumn,
          ...transformRawColumnData(item)
        };
        
        console.log(`📝 Transformed column "${item.name}":`, {
          type: item.type,
          rawOptions: item.options,
          parsedOptions: transformed.options,
          optionsCount: transformed.options?.length || 0
        });
        
        return transformed;
      });
      
      console.log('✅ useColumnsQuery - Final transformed columns:', transformedColumns);
      return transformedColumns;
    },
    enabled: enabled
  });

  return {
    ...query,
    columns: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch
  };
};

// Separate function for fetching columns by category (backward compatibility)
export const fetchColumnsByCategory = async (categoryId: string): Promise<Column[]> => {
  const { data, error } = await supabase
    .from('columns')
    .select('*')
    .eq('category_id', categoryId)
    .order('order_index');

  if (error) throw error;
  return (data || []).map(convertDbColumnToColumn);
};

export const useColumnMutation = () => {
  const queryClient = useQueryClient();

  const createColumn = async (column: ColumnFormValues): Promise<Column> => {
    const columnData = {
      ...column,
      options: column.options ? JSON.stringify(column.options) : null,
      validation: column.validation ? JSON.stringify(column.validation) : null,
    };

    const { data, error } = await supabase
      .from('columns')
      .insert([columnData])
      .select()
      .single();

    if (error) throw error;
    return data as Column;
  };

  const updateColumn = async (column: Column): Promise<Column> => {
    const columnData = {
      ...column,
      options: column.options ? JSON.stringify(column.options) : null,
      validation: column.validation ? JSON.stringify(column.validation) : null,
    };

    const { data, error } = await supabase
      .from('columns')
      .update(columnData)
      .eq('id', column.id)
      .select()
      .single();

    if (error) throw error;
    return data as Column;
  };

  const deleteColumn = async (id: string): Promise<string> => {
    const { error } = await supabase
      .from('columns')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return id;
  };

  const createMutation = useMutation({
    mutationFn: createColumn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateColumn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteColumn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
    },
  });

  return { createMutation, updateMutation, deleteMutation };
};
