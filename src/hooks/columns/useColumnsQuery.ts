import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Column, ColumnOption, ColumnType } from '@/types/column';

interface UseColumnsQueryOptions {
  categoryId?: string;
  enabled?: boolean;
}

export const useColumnsQuery = ({ categoryId, enabled = true }: UseColumnsQueryOptions) => {
  const fetchColumns = async (): Promise<Column[]> => {
    try {
      // Əvvəlcə Supabase-də aktiv session-ın olub-olmadığını yoxlayaq
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('Current session:', sessionData?.session ? 'Active' : 'No active session');
      
      let query = supabase
        .from('columns')
        .select('*');
        
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      
      console.log('Supabase query executing for columns...');
      const { data, error } = await query.order('order_index');
      
      if (error) {
        console.error('Supabase error when fetching columns:', error);
        throw error;
      }
      
      console.log('Columns fetched successfully:', data?.length || 0, 'items');
      if (data?.length > 0) {
        console.log('Sample column data:', data[0]);
      } else {
        console.log('No columns found in the database');
      }
      
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

          // Extract additional column field data - safely check if these optional fields exist
          // TypeScript buna görə xəta verir, çünki baza sxemində bu xassələr məcburi deyil
          const description = (column as any).description || '';
          const section = (column as any).section || '';
          const color = (column as any).color || '';

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
    } catch (error) {
      console.error('Error in fetchColumns:', error);
      throw error;
    }
  };

  return useQuery({
    queryKey: ['columns', categoryId],
    queryFn: fetchColumns,
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (əvvəlki versiyalarda cacheTime kimi tanınırdı)
    retry: 3
  });
};

export default useColumnsQuery;
