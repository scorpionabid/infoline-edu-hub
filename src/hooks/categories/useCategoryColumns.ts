
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Column, ColumnOption, ColumnType, parseColumnOptions, parseValidationRules } from "@/types/column";

/**
 * Hook to fetch columns for a specific category
 */
const useCategoryColumns = (categoryId: string | undefined) => {
  const query = useQuery({
    queryKey: ['category-columns', categoryId],
    queryFn: async () => {
      if (!categoryId) return [];
      
      const { data, error } = await supabase
        .from('columns')
        .select('*')
        .eq('category_id', categoryId)
        .order('order_index', { ascending: true });
        
      if (error) throw error;
      
      // Convert to Column[] with proper type handling
      return (data || []).map((item: any): Column => {
        return {
          id: item.id,
          category_id: item.category_id,
          name: item.name,
          type: item.type as ColumnType,
          is_required: item.is_required,
          placeholder: item.placeholder || '',
          help_text: item.help_text || '',
          description: item.description || '',
          order_index: item.order_index,
          status: item.status,
          validation: parseValidationRules(item.validation),
          default_value: item.default_value || '',
          options: parseColumnOptions(item.options),
          created_at: item.created_at,
          updated_at: item.updated_at,
          section: item.section || ''
        };
      });
    },
    enabled: !!categoryId
  });
  
  return query;
};

export default useCategoryColumns;
