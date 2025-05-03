
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CategoryWithColumns } from '@/types/category';
import { useAuth } from '@/context/auth';

export const useCategoryData = () => {
  const [categories, setCategories] = useState<CategoryWithColumns[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const refreshCategories = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*');
      
      if (categoriesError) throw categoriesError;
      
      // For each category, fetch its columns
      const categoriesWithColumns = await Promise.all(
        categoriesData.map(async (category) => {
          const { data: columnsData, error: columnsError } = await supabase
            .from('columns')
            .select('*')
            .eq('category_id', category.id);
          
          if (columnsError) {
            console.error(`Error fetching columns for category ${category.id}:`, columnsError);
            return { ...category, columns: [] };
          }
          
          return { ...category, columns: columnsData || [] } as CategoryWithColumns;
        })
      );
      
      setCategories(categoriesWithColumns);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err.message || 'Kateqoriyalar yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  useEffect(() => {
    refreshCategories();
  }, [refreshCategories]);
  
  return {
    categories,
    loading,
    error,
    refreshCategories
  };
};
