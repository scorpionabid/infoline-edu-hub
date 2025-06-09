
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Column, ColumnType } from '@/types/column';

// Helper function to convert database column to typed Column
const convertDbColumnToColumn = (dbColumn: any): Column => {
  return {
    ...dbColumn,
    type: dbColumn.type as ColumnType,
    options: dbColumn.options ? (typeof dbColumn.options === 'string' ? JSON.parse(dbColumn.options) : dbColumn.options) : [],
    validation: dbColumn.validation ? (typeof dbColumn.validation === 'string' ? JSON.parse(dbColumn.validation) : dbColumn.validation) : {},
    description: dbColumn.help_text || '',
    section: '',
    color: '',
    created_at: dbColumn.created_at,
    updated_at: dbColumn.updated_at
  };
};

export const useColumnsQuery = ({ categoryId, enabled = true }: { categoryId?: string; enabled?: boolean } = {}) => {
  const query = useQuery({
    queryKey: ['columns', categoryId],
    queryFn: async () => {
      console.log('Fetching columns for categoryId:', categoryId);
      
      let queryBuilder = supabase
        .from('columns')
        .select('*')
        .eq('status', 'active')
        .order('order_index');

      if (categoryId) {
        queryBuilder = queryBuilder.eq('category_id', categoryId);
      }

      const { data, error } = await queryBuilder;

      if (error) {
        console.error('Error fetching columns:', error);
        throw error;
      }
      
      console.log('Fetched columns:', data);
      // Convert database columns to typed Columns
      return (data || []).map(convertDbColumnToColumn);
    },
    enabled: enabled
  });

  return {
    ...query,
    columns: query.data || [],
    loading: query.isLoading,
    error: query.error
  };
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
