
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CategoryWithColumns, Column } from '@/types/column';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

export const useCategoryData = (schoolId?: string) => {
  const [categories, setCategories] = useState<CategoryWithColumns[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();
  const { isSchoolAdmin, isSectorAdmin, isRegionAdmin, isSuperAdmin } = usePermissions();

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Kategoriyaların seçilməsi
      let query = supabase.from('categories')
        .select('*')
        .eq('status', 'active')
        .eq('archived', false);

      // İstifadəçi roluna görə filtrləmə
      if (isSchoolAdmin) {
        // Məktəb adminləri üçün yalnız "all" təyinatlı kateqoriyaları göstər
        query = query.eq('assignment', 'all');
      } else if (isSectorAdmin) {
        // Sektor və Region adminləri üçün həm "all" həm də "sectors" təyinatlı kateqoriyaları göstər
        query = query.in('assignment', ['all', 'sectors']);
      }

      const { data: categoryData, error: categoryError } = await query;

      if (categoryError) throw categoryError;

      if (!categoryData) {
        setCategories([]);
        setLoading(false);
        return;
      }

      // Sütunları əldə et
      const { data: columnData, error: columnError } = await supabase
        .from('columns')
        .select('*')
        .in('category_id', categoryData.map(cat => cat.id))
        .eq('status', 'active')
        .order('order_index', { ascending: true });

      if (columnError) throw columnError;

      // Kateqoriyalara sütunları əlavə et
      const categoriesWithColumns: CategoryWithColumns[] = categoryData.map(category => {
        const categoryColumns = columnData
          .filter(column => column.category_id === category.id)
          .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
          .map(col => ({
            ...col,
            type: col.type as Column['type']
          }));

        return {
          ...category,
          status: category.status as CategoryWithColumns['status'],
          columns: categoryColumns as Column[],
          columnCount: categoryColumns.length,
          completionRate: 0 // Default completion rate
        };
      });

      setCategories(categoriesWithColumns);
    } catch (err: any) {
      console.error('Kateqoriyaları yükləyərkən xəta:', err);
      setError(err.message);
      toast.error(t('errorFetchingData'));
    } finally {
      setLoading(false);
    }
  }, [isSchoolAdmin, isSectorAdmin, isRegionAdmin, isSuperAdmin, t]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refreshCategories: fetchCategories
  };
};
