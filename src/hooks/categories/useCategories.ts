
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CategoryWithColumns } from '@/types/column';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

export const useCategories = () => {
  const [categories, setCategories] = useState<CategoryWithColumns[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('status', 'active')
        .order('priority', { ascending: true });
      
      if (categoriesError) throw categoriesError;
      
      if (!categoriesData || categoriesData.length === 0) {
        setCategories([]);
        setIsLoading(false);
        return;
      }

      // Fetch columns for each category
      const categoriesWithColumns = await Promise.all(
        categoriesData.map(async (category) => {
          const { data: columns, error: columnsError } = await supabase
            .from('columns')
            .select('*')
            .eq('category_id', category.id)
            .eq('status', 'active')
            .order('order_index', { ascending: true });
          
          if (columnsError) throw columnsError;
          
          return {
            ...category,
            columns: columns || []
          } as CategoryWithColumns;
        })
      );
      
      setCategories(categoriesWithColumns);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err.message || t('errorFetchingCategories'));
      toast.error(t('errorFetchingCategories'), {
        description: err.message
      });
    } finally {
      setIsLoading(false);
    }
  }, [t]);
  
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  
  const refreshCategories = useCallback(() => {
    return fetchCategories();
  }, [fetchCategories]);
  
  return {
    categories,
    isLoading,
    error,
    refreshCategories
  };
};
