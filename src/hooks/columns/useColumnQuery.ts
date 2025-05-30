import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Column, ColumnOption, ColumnType } from '@/types/column';
import { ensureJson } from '@/types/json';

interface UseColumnQueryOptions {
  columnId?: string;
  enabled?: boolean;
}

export const useColumnQuery = ({ columnId, enabled = true }: UseColumnQueryOptions) => {
  const fetchColumn = async (): Promise<Column | null> => {
    if (!columnId) return null;

    const { data, error } = await supabase
      .from('columns')
      .select('*')
      .eq('id', columnId)
      .single();

    if (error) throw error;
    
    // Transform the data to match the Column interface
    if (data) {
      // Parse JSON fields if they're stored as strings
      const options = data.options 
        ? (typeof data.options === 'string' 
            ? JSON.parse(data.options) 
            : data.options)
        : undefined;
      
      const validation = data.validation 
        ? (typeof data.validation === 'string'
            ? JSON.parse(data.validation)
            : data.validation)
        : undefined;

      // Ensure options is properly formatted as ColumnOption[]
      const formattedOptions = Array.isArray(options) 
        ? options.map((opt: any): ColumnOption => ({
            id: opt.id || String(Math.random()),
            label: opt.label || '',
            value: opt.value || ''
          }))
        : undefined;

      // Extract additional column field data (with fallbacks for missing DB fields)
      const description = '';  // Database-də description field yoxdur
      const section = '';      // Database-də section field yoxdur  
      const color = '';        // Database-də color field yoxdur
      
      // Convert database column to our Column type
      return {
        id: data.id,
        category_id: data.category_id,
        name: data.name,
        type: data.type as ColumnType,
        is_required: data.is_required,
        placeholder: data.placeholder || '',
        help_text: data.help_text || '',
        order_index: data.order_index,
        status: data.status || 'active',
        validation: validation,
        default_value: data.default_value || '',
        options: formattedOptions,
        created_at: data.created_at,
        updated_at: data.updated_at,
        description: description,
        section: section,
        color: color,
      };
    }
    
    return null;
  };

  return useQuery({
    queryKey: ['column', columnId],
    queryFn: fetchColumn,
    enabled: Boolean(columnId) && enabled
  });
};

export default useColumnQuery;
