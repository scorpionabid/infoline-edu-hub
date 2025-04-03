
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { CategoryWithColumns, adaptSupabaseColumn } from '@/types/column';
import { CategoryEntryData, DataEntryStatus } from '@/types/dataEntry';
import { v4 as uuid } from 'uuid'; // uuid import edildi

export const useCategoryData = (schoolId?: string) => {
  const [categories, setCategories] = useState<CategoryWithColumns[]>([]);
  const [categoryEntryData, setCategoryEntryData] = useState<CategoryEntryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Kategoriyaları yükləyin
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      // Bu bir təqlid fetch əməliyyatıdır, real tətbiqdə server sorğusu olacaq
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('status', 'active')
        .order('priority');

      if (categoriesError) throw categoriesError;

      // Hər bir kateqoriya üçün sütunları əldə edin
      const categoriesWithColumns = await Promise.all(
        categoriesData.map(async (category) => {
          const { data: columnsData, error: columnsError } = await supabase
            .from('columns')
            .select('*')
            .eq('category_id', category.id)
            .eq('status', 'active')
            .order('order_index');

          if (columnsError) throw columnsError;

          // Sütunları adaptasiya edin
          const adaptedColumns = columnsData.map(adaptSupabaseColumn);

          return {
            id: category.id,
            name: category.name,
            description: category.description || '',
            assignment: category.assignment as 'all' | 'sectors',
            deadline: category.deadline || '',
            status: category.status || 'active',
            priority: category.priority || 0,
            order: category.priority || 0, // Burada order xassəsini əlavə edirik
            createdAt: category.created_at,
            updatedAt: category.updated_at,
            columns: adaptedColumns,
          };
        })
      );

      setCategories(categoriesWithColumns);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setIsError(true);
      setIsLoading(false);
      toast.error('Kateqoriyalar yüklənərkən xəta baş verdi');
    }
  }, []);

  // Kategoriya məlumatlarının qəbulunu simulyasiya edin
  const fetchCategoryEntryData = useCallback(async () => {
    if (!schoolId) return;

    setIsLoading(true);
    setIsError(false);

    try {
      // Bu bir təqlid datadır, real tətbiqdə server əməliyyatı olacaq
      setTimeout(() => {
        const mockEntryData = categories.map(category => ({
          categoryId: category.id,
          entries: category.columns.map(column => ({
            columnId: column.id,
            value: '',
            status: 'draft' as DataEntryStatus
          })),
          status: 'draft' as DataEntryStatus,
          isCompleted: false,
          isSubmitted: false,
          completionPercentage: 0
        }));

        setCategoryEntryData(mockEntryData);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching entry data:', error);
      setIsError(true);
      setIsLoading(false);
      toast.error('Məlumatlar yüklənərkən xəta baş verdi');
    }
  }, [categories, schoolId]);

  // Kategoriya məlumatlarını yeniləyin
  const updateCategoryData = useCallback(async (updatedData: CategoryEntryData[]) => {
    if (!schoolId) return false;

    try {
      setCategoryEntryData(updatedData);
      toast.success('Məlumatlar uğurla yeniləndi');
      return true;
    } catch (error) {
      console.error('Error saving data:', error);
      toast.error('Məlumatlar yenilənərkən xəta baş verdi');
      return false;
    }
  }, [schoolId]);

  // Kategoriyanı təqdim edin
  const submitCategory = useCallback(async (categoryId: string) => {
    if (!schoolId) return false;

    try {
      setCategoryEntryData(prev => prev.map(entry => 
        entry.categoryId === categoryId ? { ...entry, status: 'submitted', isSubmitted: true } : entry
      ));
      toast.success('Kateqoriya uğurla təqdim edildi');
      return true;
    } catch (error) {
      console.error('Error submitting category:', error);
      toast.error('Kateqoriya təqdim edilərkən xəta baş verdi');
      return false;
    }
  }, [schoolId]);

  // İlk yükləmədə kategoriyaları əldə edin
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Kategoriyalar yükləndikdən sonra məlumatları əldə edin
  useEffect(() => {
    if (categories.length > 0 && schoolId) {
      fetchCategoryEntryData();
    }
  }, [categories, schoolId, fetchCategoryEntryData]);

  return {
    categories,
    categoryEntryData,
    isLoading,
    isError,
    fetchCategories,
    fetchCategoryEntryData,
    updateCategoryData,
    submitCategory
  };
};
