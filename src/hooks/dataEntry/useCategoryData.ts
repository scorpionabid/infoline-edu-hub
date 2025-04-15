
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CategoryWithColumns, Column, adaptDbColumnToAppColumn } from '@/types/column';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export const useCategoryData = () => {
  const [categories, setCategories] = useState<CategoryWithColumns[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user } = useAuth();

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Kateqoriyaları əldə et
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('archived', false)
        .order('priority', { ascending: true });

      if (categoriesError) throw categoriesError;

      // Sütunları əldə et
      const { data: columnsData, error: columnsError } = await supabase
        .from('columns')
        .select('*')
        .eq('status', 'active')
        .order('order_index', { ascending: true });

      if (columnsError) throw columnsError;

      // Sütunları kateqoriyalara görə qruplaşdır
      const categoriesWithColumns: CategoryWithColumns[] = categoriesData.map(category => {
        const categoryColumns = columnsData
          .filter(column => column.category_id === category.id)
          .map(column => adaptDbColumnToAppColumn(column));

        return {
          id: category.id,
          name: category.name,
          description: category.description,
          assignment: category.assignment as 'all' | 'sectors',
          deadline: category.deadline,
          status: category.status as 'active' | 'inactive' | 'draft',
          priority: category.priority,
          created_at: category.created_at,
          updated_at: category.updated_at,
          archived: category.archived,
          column_count: categoryColumns.length,
          columns: categoryColumns
        };
      });

      setCategories(categoriesWithColumns);
    } catch (err: any) {
      console.error('Kateqoriyaları əldə edərkən xəta:', err);
      setError(new Error(t('errorFetchingCategories')));
      toast({
        title: t('error'),
        description: t('errorFetchingCategories'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [t, toast]);

  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user, fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  };
};

export default useCategoryData;
