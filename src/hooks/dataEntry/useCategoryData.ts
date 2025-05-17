
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CategoryWithColumns } from '@/types/category';

export interface UseCategoryDataResult {
  category: CategoryWithColumns | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useCategoryData = (categoryId: string | undefined): UseCategoryDataResult => {
  const [category, setCategory] = useState<CategoryWithColumns | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategoryData = async () => {
    if (!categoryId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .single();

      if (categoryError) throw categoryError;

      const { data: columnsData, error: columnsError } = await supabase
        .from('columns')
        .select('*')
        .eq('category_id', categoryId)
        .order('order_index');

      if (columnsError) throw columnsError;

      // Process columns to include additional UI properties
      const processedColumns = (columnsData || []).map(column => ({
        ...column,
        options: column.options || [],
        validation: column.validation || {},
        // Add missing properties needed by some components
        color: column.color || '#6b7280',
        description: column.description || '',
      }));

      setCategory({
        ...categoryData,
        columns: processedColumns,
      });
    } catch (err: any) {
      setError(err);
      console.error('Error fetching category data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryData();
  }, [categoryId]);

  return { 
    category, 
    loading, 
    error, 
    refetch: fetchCategoryData 
  };
};

export default useCategoryData;
