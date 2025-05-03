
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types/category';
import { CategoryWithColumns } from '@/types/column';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/auth';
import { usePermissions } from '@/hooks/auth/usePermissions';

export const useCategories = () => {
  const [categories, setCategories] = useState<CategoryWithColumns[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { t } = useLanguage();
  const { user } = useAuth();
  const { isSuperAdmin, isRegionAdmin } = usePermissions();

  const fetchCategories = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      // Kategoriyaları əldə et
      let categoryQuery = supabase.from('categories')
        .select('*')
        .eq('archived', false)
        .eq('status', 'active');

      // İstifadəçi roluna görə kategoriya filteri
      if (!isSuperAdmin && !isRegionAdmin) {
        categoryQuery = categoryQuery.in('assignment', ['all', 'sectors']);
      }

      const { data: categoryData, error: categoryError } = await categoryQuery;

      if (categoryError) throw categoryError;

      // Sütunları əldə et
      const { data: columnData, error: columnError } = await supabase
        .from('columns')
        .select('*')
        .eq('status', 'active');

      if (columnError) throw columnError;

      // Kategoriyalara sütunları əlavə et
      const enhancedCategories = categoryData.map((category: Category) => {
        const categoryColumns = columnData.filter((column: any) => 
          column.category_id === category.id
        ).sort((a: any, b: any) => a.order_index - b.order_index);
        
        return {
          ...category,
          columns: categoryColumns,
          columnCount: categoryColumns.length
        } as CategoryWithColumns;
      });

      setCategories(enhancedCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      toast.error(t('errorFetchingData'));
    } finally {
      setIsLoading(false);
    }
  }, [user, isSuperAdmin, isRegionAdmin, t]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { 
    categories, 
    isLoading, 
    error,
    refetch: fetchCategories
  };
};

export default useCategories;
