
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CategoryWithColumns, CategoryAssignment } from '@/types/category';

export const useSchoolCategories = () => {
  const [categories, setCategories] = useState<CategoryWithColumns[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select(`
            *,
            columns(*)
          `)
          .eq('status', 'active')
          .order('order_index');

        if (error) throw error;

        // Transform data with proper type casting
        const transformedData: CategoryWithColumns[] = (data || []).map(item => ({
          ...item,
          assignment: item.assignment as CategoryAssignment, // Proper type casting
          columns: item.columns || []
        }));

        setCategories(transformedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Naməlum xəta');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};
