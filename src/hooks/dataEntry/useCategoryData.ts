
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CategoryWithColumns } from '@/types/column';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/auth/useAuth';

export const useCategoryData = (schoolId?: string) => {
  const [categories, setCategories] = useState<CategoryWithColumns[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();
  const { user } = useAuth();

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
      
      // Daxil edilmiş məlumatları əldə edirik (əgər schoolId varsa)
      if (schoolId) {
        await fetchDataEntries(schoolId, categoriesWithColumns);
      }
    } catch (err: any) {
      console.error('Kateqoriyaları əldə edərkən xəta:', err);
      setError(err.message || t('errorLoadingCategories'));
      toast.error(t('errorLoadingCategories'), {
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  }, [t, schoolId]);

  const fetchDataEntries = async (schoolId: string, categoriesWithColumns: CategoryWithColumns[]) => {
    try {
      // Verilmiş məktəb üçün bütün data entries-ləri əldə edirik
      const { data: entriesData, error: entriesError } = await supabase
        .from('data_entries')
        .select('*')
        .eq('school_id', schoolId)
        .is('deleted_at', null);

      if (entriesError) throw entriesError;

      // Məlumatları kateqoriyalara əlavə edirik
      const updatedCategories = categoriesWithColumns.map(category => {
        const categoryEntries = entriesData.filter(entry => entry.category_id === category.id);
        const completionCount = categoryEntries.length;
        const totalFields = category.columns.length;
        const completionPercentage = totalFields > 0 ? Math.round((completionCount / totalFields) * 100) : 0;

        // Kateqoriyanın statusunu təyin edirik
        let status = 'draft';
        if (categoryEntries.length > 0) {
          // Əgər bütün entries-lər eyni statusdadırsa, kateqoriyanın statusu da o olur
          const statuses = new Set(categoryEntries.map(entry => entry.status));
          if (statuses.size === 1) {
            status = categoryEntries[0].status;
          } else if (statuses.has('rejected')) {
            status = 'rejected';
          } else if (statuses.has('pending')) {
            status = 'pending';
          } else if (statuses.has('approved') && statuses.has('draft')) {
            status = 'partial';
          }
        }

        return {
          ...category,
          entries: categoryEntries,
          completionPercentage,
          status
        };
      });

      setCategories(updatedCategories);
    } catch (err: any) {
      console.error('Daxil edilmiş məlumatları əldə edərkən xəta:', err);
      toast.error(t('errorLoadingEntries'), {
        description: err.message
      });
    }
  };

  // Real-time yeniləmələri dinləyirik
  useEffect(() => {
    fetchCategories();

    // Real-time subscriptions
    const categoriesSubscription = supabase
      .channel('categories-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'categories'
      }, () => {
        console.log('Kateqoriyalar yeniləndi');
        fetchCategories();
      })
      .subscribe();

    const columnsSubscription = supabase
      .channel('columns-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'columns'
      }, () => {
        console.log('Sütunlar yeniləndi');
        fetchCategories();
      })
      .subscribe();

    // Əgər məktəb ID-si varsa, məlumat dəyişikliklərini də dinləyirik
    let entriesSubscription: any;
    if (schoolId) {
      entriesSubscription = supabase
        .channel('entries-changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'data_entries',
          filter: `school_id=eq.${schoolId}`
        }, () => {
          console.log('Məlumatlar yeniləndi');
          fetchCategories();
        })
        .subscribe();
    }

    // Cleanup function
    return () => {
      categoriesSubscription.unsubscribe();
      columnsSubscription.unsubscribe();
      if (entriesSubscription) {
        entriesSubscription.unsubscribe();
      }
    };
  }, [fetchCategories, schoolId, user?.id]);

  const refreshCategories = useCallback(async () => {
    await fetchCategories();
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
