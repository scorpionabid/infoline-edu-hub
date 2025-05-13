
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Column, ColumnOption } from '@/types/column';

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
            value: opt.value || '',
            color: opt.color || undefined,
            disabled: opt.disabled || false
          }))
        : undefined;

      return {
        id: data.id,
        category_id: data.category_id,
        name: data.name,
        type: data.type,
        is_required: data.is_required,
        placeholder: data.placeholder,
        help_text: data.help_text,
        order_index: data.order_index,
        status: data.status,
        validation: validation,
        default_value: data.default_value,
        options: formattedOptions,
        created_at: data.created_at,
        updated_at: data.updated_at,
        description: data.description || '',
        color: data.color || undefined
      } as Column;
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
