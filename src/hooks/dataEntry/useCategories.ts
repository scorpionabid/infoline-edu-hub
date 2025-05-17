
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CategoryWithColumns } from '@/types/category';

interface UseCategoriesResult {
  categories: CategoryWithColumns[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useCategories = (initialCategories?: CategoryWithColumns[]): UseCategoriesResult => {
  const [categories, setCategories] = useState<CategoryWithColumns[]>(initialCategories || []);
  const [loading, setLoading] = useState<boolean>(!initialCategories);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('status', 'active')
        .order('priority', { ascending: false });

      if (error) throw error;

      // Fetch columns for each category
      const categoriesWithColumns: CategoryWithColumns[] = [];
      
      for (const category of data) {
        try {
          const { data: columns, error: columnsError } = await supabase
            .from('columns')
            .select('*')
            .eq('category_id', category.id)
            .order('order_index');
            
          if (columnsError) throw columnsError;

          const processedColumns = columns.map((column: any) => ({
            ...column,
            options: column.options ? JSON.parse(JSON.stringify(column.options)) : [],
            validation: column.validation ? JSON.parse(JSON.stringify(column.validation)) : {}
          }));

          categoriesWithColumns.push({
            ...category,
            columns: processedColumns
          });
        } catch (columnsErr) {
          console.error('Error fetching columns for category:', category.id, columnsErr);
          categoriesWithColumns.push({
            ...category,
            columns: []
          });
        }
      }

      setCategories(categoriesWithColumns);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialCategories) {
      fetchCategories();
    }
  }, []);

  return { categories, loading, error, refetch: fetchCategories };
};

export default useCategories;
