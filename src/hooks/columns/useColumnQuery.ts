
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Column } from '@/types/column';

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
      return {
        ...data,
        options: data.options ? (typeof data.options === 'string' ? JSON.parse(data.options) : data.options) : undefined,
        validation: data.validation ? (typeof data.validation === 'string' ? JSON.parse(data.validation) : data.validation) : undefined
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
