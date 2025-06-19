
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Column, ColumnOption } from "@/types/column";

const useCategoryColumns = (categoryId: string | undefined) => {
  const query = useQuery({
    queryKey: ['category-columns', categoryId],
    queryFn: async () => {
      if (!categoryId) return [];
      
      const { data, error } = await supabase
        .from('columns')
        .select('*')
        .eq('category_id', categoryId)
        .order('name', { ascending: true }); // name üzrə sırala çünki order_index mövcud deyil
        
      if (error) throw error;
      
      return (data || []).map((item: any): Column => {
        const options = item.options 
          ? (typeof item.options === 'string' ? JSON.parse(item.options) : item.options)
          : [];
          
        const validation = item.validation
          ? (typeof item.validation === 'string' ? JSON.parse(item.validation) : item.validation)
          : null;
          
        const formattedOptions = Array.isArray(options) 
          ? options.map((opt: any): ColumnOption => ({
              id: opt.id || String(Math.random()),
              label: opt.label || '',
              value: opt.value || ''
            }))
          : [];
        
        return {
          id: item.id,
          category_id: item.category_id,
          name: item.name,
          type: item.type,
          is_required: item.is_required,
          placeholder: item.placeholder || '',
          help_text: item.help_text || '',
          order_index: item.order_index,
          status: item.status,
          validation: validation,
          default_value: item.default_value || '',
          options: formattedOptions,
          created_at: item.created_at,
          updated_at: item.updated_at,
          description: item.description || '',
          section: item.section || ''
        };
      });
    },
    enabled: !!categoryId
  });
  
  return query;
};

export default useCategoryColumns;
