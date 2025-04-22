
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CategoryWithColumns } from '@/types/column';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

export const useCategoryData = (schoolId?: string) => {
  const [categories, setCategories] = useState<CategoryWithColumns[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Kateqoriyaları əldə edirik
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('status', 'active')
        .order('priority', { ascending: true });

      if (categoriesError) throw categoriesError;

      // Kateqoriyalar üçün sütunları əldə edirik
      const { data: columnsData, error: columnsError } = await supabase
        .from('columns')
        .select('*')
        .in('category_id', categoriesData.map(c => c.id))
        .eq('status', 'active')
        .order('order_index', { ascending: true });

      if (columnsError) throw columnsError;

      // Kateqoriyaları və sütunları birləşdiririk
      const categoriesWithColumns: CategoryWithColumns[] = categoriesData.map(category => {
        return {
          ...category,
          columns: columnsData.filter(column => column.category_id === category.id) || []
        };
      });

      setCategories(categoriesWithColumns);
    } catch (err: any) {
      console.error('Kateqoriyaları əldə edərkən xəta:', err);
      setError(err.message || t('errorLoadingCategories'));
      toast.error(t('errorLoadingCategories'), {
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  }, [t]);

  const refreshCategories = useCallback(async () => {
    await fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const getCategoryById = useCallback((categoryId: string) => {
    return categories.find(c => c.id === categoryId);
  }, [categories]);

  return {
    categories,
    loading,
    error,
    getCategoryById,
    refreshCategories
  };
};
