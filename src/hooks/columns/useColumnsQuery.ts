
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Column, ColumnOption, ColumnType } from '@/types/column';

interface UseColumnsQueryOptions {
  categoryId?: string;
  enabled?: boolean;
}

export const useColumnsQuery = ({ categoryId, enabled = true }: UseColumnsQueryOptions) => {
  const fetchColumns = async (): Promise<Column[]> => {
    if (!categoryId) return [];

    const { data, error } = await supabase
      .from('columns')
      .select('*')
      .eq('category_id', categoryId)
      .order('order_index');

    if (error) throw error;
    
    // Transform the data to match the Column interface
    if (data && Array.isArray(data)) {
      return data.map(column => {
        // Parse JSON fields if they're stored as strings
        const options = column.options 
          ? (typeof column.options === 'string' 
              ? JSON.parse(column.options) 
              : column.options)
          : [];
        
        const validation = column.validation 
          ? (typeof column.validation === 'string'
              ? JSON.parse(column.validation)
              : column.validation)
          : {};
        
        // Ensure options is properly formatted as ColumnOption[]
        const formattedOptions = Array.isArray(options) 
          ? options.map((opt: any): ColumnOption => ({
              id: opt.id || String(Math.random()),
              label: opt.label || '',
              value: opt.value || ''
            }))
          : [];

        // Extract additional column field data
        const description = column.description || '';
        const section = column.section || '';
        const color = column.color || '';

        // Convert database column to our Column type
        return {
          id: column.id,
          category_id: column.category_id,
          name: column.name,
          type: column.type as ColumnType,
          is_required: column.is_required,
          placeholder: column.placeholder || '',
          help_text: column.help_text || '',
          order_index: column.order_index,
          status: column.status || 'active',
          validation: validation,
          default_value: column.default_value || '',
          options: formattedOptions,
          created_at: column.created_at,
          updated_at: column.updated_at,
          description: description,
          section: section,
          color: color,
        } as Column;
      });
    }
    
    return [];
  };

  return useQuery({
    queryKey: ['columns', categoryId],
    queryFn: fetchColumns,
    enabled: Boolean(categoryId) && enabled
  });
};

export default useColumnsQuery;
