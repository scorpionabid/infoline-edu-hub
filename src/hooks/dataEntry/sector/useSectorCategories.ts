import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CategoryWithColumns } from '@/types/category';

export const useSectorCategories = () => {
  const [categories, setCategories] = useState<CategoryWithColumns[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSectorCategories = async () => {
    try {
      setLoading(true);
      
      // Yalnız assignment = "sectors" olan kateqoriyaları əldə et
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('assignment', 'sectors')
        .eq('status', 'active')
        .order('priority', { ascending: true });
      
      if (error) throw error;
      
      if (!data) {
        setCategories([]);
        return;
      }
      
      // Load columns for each category
      const categoriesWithColumns = await Promise.all(
        data.map(async (category) => {
          const { data: columns, error: columnsError } = await supabase
            .from('columns')
            .select('*')
            .eq('category_id', category.id)
            .eq('status', 'active')
            .order('order_index', { ascending: true });
          
          if (columnsError) {
            console.error('Error loading columns:', columnsError);
            return { ...category, columns: [] };
          }
          
          return { ...category, columns: columns || [] };
        })
      );
      
      setCategories(categoriesWithColumns);
    } catch (err: any) {
      console.error('Error loading sector categories:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSectorCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    reload: loadSectorCategories
  };
};
