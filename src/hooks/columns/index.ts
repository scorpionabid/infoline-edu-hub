
export { useColumnMutations } from './useColumnMutations';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Column, ColumnType, ColumnStatus } from '@/types/column';
import { assertColumnStatus } from '@/utils/buildFixes';

// Fixed useColumnsQuery hook
export const useColumnsQuery = (options: { status?: string; enabled?: boolean } = {}) => {
  const { status = 'all', enabled = true } = options;
  
  return useQuery({
    queryKey: ['columns', status],
    queryFn: async (): Promise<Column[]> => {
      console.log('🔍 useColumnsQuery - Fetching columns with status:', status);
      
      let query = supabase
        .from('columns')
        .select(`
          *,
          categories!inner(name)
        `)
        .order('order_index');

      // Filter by status if not 'all'
      if (status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching columns:', error);
        throw error;
      }

      console.log('✅ Fetched columns:', data?.length || 0);
      
      // Transform data to match Column interface with proper type casting
      const transformedColumns: Column[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        type: item.type as ColumnType, // Type assertion for database string to ColumnType
        category_id: item.category_id,
        placeholder: item.placeholder,
        help_text: item.help_text,
        is_required: item.is_required || false,
        default_value: item.default_value,
        options: item.options ? (typeof item.options === 'string' ? JSON.parse(item.options) : item.options) : [],
        validation: item.validation ? (typeof item.validation === 'string' ? JSON.parse(item.validation) : item.validation) : {},
        order_index: item.order_index || 0,
        status: assertColumnStatus(item.status || 'active') as ColumnStatus,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      console.log('✅ Transformed columns:', transformedColumns);
      return transformedColumns;
    },
    enabled: enabled
  });
};
