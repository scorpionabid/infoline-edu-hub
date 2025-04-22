import { useState, useEffect, useCallback } from 'react';
import { supabase, createRealTimeChannel } from '@/integrations/supabase/client';
import { CategoryWithColumns } from '@/types/column';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/auth/useAuth';

// JSON sahələrini parse etmək üçün köməkçi funksiya
const parseJsonField = (value: any): any => {
  if (!value) return null;
  
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (e) {
      // Xüsusi format: {"label":"X","value":"x"},{"label":"Y","value":"y"}
      if (value.includes('},{')) {
        try {
          const jsonStr = value.startsWith('[') ? value : `[${value}]`;
          return JSON.parse(jsonStr);
        } catch (err) {
          console.warn('Xüsusi formatı parse etmək alınmadı');
        }
      }
      
      // Vergüllə ayrılmış siyahı
      if (value.includes(',')) {
        return value.split(',')
          .map(item => item.trim())
          .filter(Boolean)
          .map(item => ({ label: item, value: item }));
      }
      
      return value;
    }
  }
  
  return value;
};

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
      console.log('Kateqoriyalar yüklənir...');

      // Kateqoriyaları əldə edirik
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('status', 'active')
        .order('priority', { ascending: true });

      if (categoriesError) {
        console.error('Kateqoriyaları əldə edərkən xəta:', categoriesError);
        throw categoriesError;
      }

      console.log(`${categoriesData?.length || 0} kateqoriya tapıldı`);

      if (!categoriesData || categoriesData.length === 0) {
        setCategories([]);
        setLoading(false);
        return;
      }

      // Kateqoriyalar üçün sütunları əldə edirik
      const { data: columnsData, error: columnsError } = await supabase
        .from('columns')
        .select('*')
        .in('category_id', categoriesData.map(c => c.id))
        .eq('status', 'active')
        .order('order_index', { ascending: true });

      if (columnsError) {
        console.error('Sütunları əldə edərkən xəta:', columnsError);
        throw columnsError;
      }

      console.log(`${columnsData?.length || 0} sütun tapıldı`);

      // Sütunları işləyirik - options və validation sahələrini parse edirik
      const processedColumnsData = columnsData?.map(column => {
        // Options və validation sahələrini parse edirik
        return {
          ...column,
          options: parseJsonField(column.options),
          validation: parseJsonField(column.validation)
        };
      }) || [];

      // Kateqoriyaları və sütunları birləşdiririk
      const categoriesWithColumns: CategoryWithColumns[] = categoriesData.map(category => {
        return {
          ...category,
          columns: processedColumnsData?.filter(column => column.category_id === category.id) || []
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
      console.log(`${schoolId} üçün məlumatlar yüklənir...`);
      
      // Verilmiş məktəb üçün bütün data entries-ləri əldə edirik
      const { data: entriesData, error: entriesError } = await supabase
        .from('data_entries')
        .select('*')
        .eq('school_id', schoolId)
        .is('deleted_at', null);

      if (entriesError) {
        console.error('Məlumatları əldə edərkən xəta:', entriesError);
        throw entriesError;
      }

      console.log(`${entriesData?.length || 0} məlumat tapıldı`);

      // Məlumatları kateqoriyalara əlavə edirik
      const updatedCategories = categoriesWithColumns.map(category => {
        const categoryEntries = entriesData?.filter(entry => entry.category_id === category.id) || [];
        const completionCount = category.columns.filter(col => 
          categoryEntries.some(entry => entry.column_id === col.id)
        ).length;
        
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
    console.log('Real-time kanalları abunə olunur...');
    fetchCategories();

    // Real-time subscriptions
    const categoriesChannel = createRealTimeChannel(
      'categories-changes',
      'categories',
      '*'
    ).subscribe((payload) => {
      console.log('Kateqoriyalar yeniləndi:', payload);
      fetchCategories();
    });

    const columnsChannel = createRealTimeChannel(
      'columns-changes',
      'columns',
      '*'
    ).subscribe((payload) => {
      console.log('Sütunlar yeniləndi:', payload);
      fetchCategories();
    });

    // Əgər məktəb ID-si varsa, məlumat dəyişikliklərini də dinləyirik
    let entriesChannel: any;
    if (schoolId) {
      entriesChannel = createRealTimeChannel(
        'entries-changes',
        'data_entries',
        '*',
        `school_id=eq.${schoolId}`
      ).subscribe((payload) => {
        console.log('Məlumatlar yeniləndi:', payload);
        fetchCategories();
      });
    }

    // Cleanup function
    return () => {
      supabase.removeChannel(categoriesChannel);
      supabase.removeChannel(columnsChannel);
      if (entriesChannel) {
        supabase.removeChannel(entriesChannel);
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
    refreshCategories,
    getCategoryById
  };
};
