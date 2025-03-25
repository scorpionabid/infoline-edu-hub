
import { useState, useRef, useCallback } from 'react';
import { CategoryWithColumns } from '@/types/column';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

export const useDataEntryState = (initialCategoryId?: string | null) => {
  const [categories, setCategories] = useState<CategoryWithColumns[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const lastCategoryIdRef = useRef<string | null>(initialCategoryId);
  const { user } = useAuth();
  const { t } = useLanguage();

  // Kateqoriyaları və sütunları Supabase-dən çəkmək
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      // Əvvəlcə kateqoriyaları çəkək
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('status', 'active')
        .order('priority', { ascending: true });

      if (categoriesError) throw categoriesError;

      // Əgər kateqoriya yoxdursa, boş massiv qaytaraq
      if (!categoriesData || categoriesData.length === 0) {
        setCategories([]);
        setIsLoading(false);
        return;
      }

      // Hər bir kateqoriyaya aid sütunları çəkək
      const categoriesWithColumns: CategoryWithColumns[] = await Promise.all(
        categoriesData.map(async (category) => {
          // Sütunları çəkək
          const { data: columnsData, error: columnsError } = await supabase
            .from('columns')
            .select('*')
            .eq('category_id', category.id)
            .eq('status', 'active')
            .order('order_index', { ascending: true });

          if (columnsError) throw columnsError;

          // Kateqoriya və sütunlar ilə obyekt yaradaq
          return {
            id: category.id,
            name: category.name,
            description: category.description || '',
            deadline: category.deadline,
            status: category.status === 'active' ? 'active' : 'inactive',
            priority: category.priority || 0,
            assignment: category.assignment === 'sectors' ? 'sectors' : 'all',
            createdAt: category.created_at,
            columns: columnsData.map(column => ({
              id: column.id,
              categoryId: column.category_id,
              name: column.name,
              type: column.type,
              isRequired: column.is_required,
              placeholder: column.placeholder || '',
              helpText: column.help_text || '',
              options: column.options,
              order: column.order_index || 0,
              status: column.status === 'active' ? 'active' : 'inactive',
              defaultValue: column.default_value || '',
              validation: column.validation
            }))
          };
        })
      );

      // Məlumatların approval statusunu yoxlayaq
      if (user?.schoolId) {
        const updatedCategoriesWithStatus = await Promise.all(
          categoriesWithColumns.map(async (category) => {
            try {
              // Kateqoriya üçün məlumatların statusunu yoxlayaq
              const { data, error } = await supabase
                .from('data_entries')
                .select('status')
                .eq('school_id', user.schoolId)
                .eq('category_id', category.id);

              if (error) throw error;

              // Məlumatların statusuna görə kateqoriya statusunu təyin edək
              if (data && data.length > 0) {
                // Əgər bütün məlumatlar approved isə, kateqoriya approved statusunu alır
                if (data.every(item => item.status === 'approved')) {
                  return { ...category, status: 'approved' as 'active' | 'inactive' };
                }
                // Əgər hər hansı məlumat rejected isə, kateqoriya rejected statusunu alır
                else if (data.some(item => item.status === 'rejected')) {
                  return { ...category, status: 'rejected' as 'active' | 'inactive' };
                }
                // Əks halda, pending statusu verilir
                else {
                  return { ...category, status: 'pending' as 'active' | 'inactive' };
                }
              }

              return category;
            } catch (err) {
              console.error(`Error checking status for category ${category.id}:`, err);
              return category;
            }
          })
        );

        setCategories(updatedCategoriesWithStatus);
      } else {
        setCategories(categoriesWithColumns);
      }

      // Əgər initialCategoryId varsa, onun indeksini tapaq
      if (initialCategoryId) {
        const categoryIndex = categoriesWithColumns.findIndex(
          category => category.id === initialCategoryId
        );
        if (categoryIndex !== -1) {
          setCurrentCategoryIndex(categoryIndex);
        }
      }
    } catch (err) {
      console.error('Error fetching categories and columns:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotLoadCategories')
      });
    } finally {
      setIsLoading(false);
    }
  }, [initialCategoryId, user, t]);

  return {
    categories,
    setCategories,
    isLoading,
    setIsLoading,
    currentCategoryIndex,
    setCurrentCategoryIndex,
    lastCategoryIdRef,
    fetchCategories
  };
};
