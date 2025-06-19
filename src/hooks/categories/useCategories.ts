
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types/category';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('status', 'active')
        .order('name', { ascending: true }); // name üzrə sırala çünki order_index mövcud deyil

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      return (data || []) as Category[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export default useCategories;
