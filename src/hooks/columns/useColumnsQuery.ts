
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Column, ColumnOption } from '@/types/column';

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
          : undefined;
        
        const validation = column.validation 
          ? (typeof column.validation === 'string'
              ? JSON.parse(column.validation)
              : column.validation)
          : undefined;
        
        // Ensure options is properly formatted as ColumnOption[]
        const formattedOptions = Array.isArray(options) 
          ? options.map((opt: any): ColumnOption => ({
              id: opt.id || String(Math.random()),
              label: opt.label || '',
              value: opt.value || ''
            }))
          : undefined;

        // Convert database column to our Column type
        return {
          id: column.id,
          category_id: column.category_id,
          name: column.name,
          type: column.type as Column['type'],
          is_required: column.is_required,
          placeholder: column.placeholder,
          help_text: column.help_text,
          order_index: column.order_index,
          status: column.status,
          validation: validation,
          default_value: column.default_value,
          options: formattedOptions,
          created_at: column.created_at,
          updated_at: column.updated_at,
          description: column.description || '', // Add default value if missing
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
