
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CategoryWithColumns } from '@/types/column';
import { Category } from '@/types/category';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

export const useCategoryData = (categoryId?: string) => {
  const [category, setCategory] = useState<CategoryWithColumns | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { t } = useLanguage();

  const fetchCategoryData = useCallback(async () => {
    if (!categoryId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Kateqoriya məlumatlarını əldə edək
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .single();

      if (categoryError) throw categoryError;

      // Sütunları əldə edək
      const { data: columnsData, error: columnsError } = await supabase
        .from('columns')
        .select('*')
        .eq('category_id', categoryId)
        .order('order_index');

      if (columnsError) throw columnsError;

      // Sütun və kateqoriya məlumatlarını birləşdirək
      const categoryWithColumns: CategoryWithColumns = {
        category: {
          id: categoryData.id,
          name: categoryData.name,
          description: categoryData.description,
          order: categoryData.order || categoryData.priority || 0,
          priority: categoryData.priority || 0,
          status: categoryData.status,
          assignment: categoryData.assignment
        },
        columns: columnsData.map(column => ({
          id: column.id,
          name: column.name, 
          type: column.type,
          categoryId: column.category_id,
          isRequired: column.is_required,
          placeholder: column.placeholder || '',
          helpText: column.help_text || '',
          defaultValue: column.default_value || '',
          orderIndex: column.order_index || 0,
          options: column.options || [],
          validation: column.validation || {},
          status: column.status || 'active',
          order: column.order || column.order_index || 0,
          parentColumnId: column.parent_column_id,
          dependsOn: column.depends_on
        })),
        // CategoryWithColumns interfeysi ilə uyğunluq üçün
        id: categoryData.id,
        name: categoryData.name,
        description: categoryData.description,
        priority: categoryData.priority || 0,
        order: categoryData.order || categoryData.priority || 0,
        status: categoryData.status,
        assignment: categoryData.assignment
      };

      setCategory(categoryWithColumns);
    } catch (err: any) {
      console.error('Kateqoriya məlumatlarını əldə edərkən xəta:', err);
      setError(err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotLoadCategory')
      });
    } finally {
      setLoading(false);
    }
  }, [categoryId, t]);

  return {
    category,
    loading,
    error,
    fetchCategoryData
  };
};
