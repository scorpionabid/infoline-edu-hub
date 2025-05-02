import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CategoryWithColumns, Column } from '@/types/column';
import { useAuth } from '@/context/auth';
import { DataEntry, DataEntryStatus } from '@/types/dataEntry';
import { toast } from 'sonner';
import { useColumnsQuery } from '@/hooks/columns/useColumnsQuery';

// Kateqoriya üçün tamamlanma faizini hesablama
const calculateCompletionPercentage = (columns: Column[], entries: DataEntry[]): number => {
  if (!columns.length) return 0;
  
  // Məcburi sütunları tap
  const requiredColumns = columns.filter(column => column.is_required);
  
  // Tamamlanmış sütunları tap (bura məcburi olmayan doldurulmuş sütunlar da daxildir)
  const completedEntries = entries.filter(entry => entry.value && entry.value.trim() !== '');
  
  // Əgər heç bir məcburi sütun yoxdursa
  if (!requiredColumns.length) {
    return completedEntries.length > 0 ? 100 : 0;
  }
  
  // Məcburi sütunların neçəsi doldurulub
  const filledRequiredColumns = requiredColumns.filter(column => 
    entries.some(entry => entry.column_id === column.id && entry.value && entry.value.trim() !== '')
  );
  
  return Math.round((filledRequiredColumns.length / requiredColumns.length) * 100);
};

// Kateqoriyanın statusunu təyin etmə
const determineStatus = (entries: DataEntry[]): DataEntryStatus | 'partial' => {
  if (!entries.length) return 'draft';
  
  const statuses = entries.map(entry => entry.status);
  
  if (statuses.every(status => status === 'approved')) return 'approved';
  if (statuses.every(status => status === 'rejected')) return 'rejected';
  if (statuses.every(status => status === 'pending')) return 'pending';
  if (statuses.every(status => status === 'draft')) return 'draft';
  
  // Qarışıq statuslar
  if (statuses.some(status => status === 'approved')) return 'partial';
  if (statuses.some(status => status === 'pending')) return 'pending';
  if (statuses.some(status => status === 'rejected')) return 'partial';
  
  return 'draft';
};

export const useCategoryData = (schoolId?: string) => {
  const [categories, setCategories] = useState<CategoryWithColumns[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Columns fetch etmə
  const columnsQuery = useColumnsQuery();
  
  // Kateqoriyaları və onların sütunlarını yükləyən funksiya
  const fetchCategoriesAndColumns = useCallback(async () => {
    try {
      console.log('Fetching categories for school:', schoolId);
      setLoading(true);
      
      // Kateqoriyaları yüklə
      let { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('priority', { ascending: true });
      
      if (categoriesError) throw categoriesError;
      
      if (!categoriesData || categoriesData.length === 0) {
        setCategories([]);
        setLoading(false);
        return;
      }
      
      // Hamı üçün əlçatan olan sütunları əldə et
      const { data: columnsData, error: columnsError } = 
        await columnsQuery.fetchAllColumns();
      
      if (columnsError) throw columnsError;
      
      let entriesData: DataEntry[] = [];
      
      // Əgər şəxsi və məktəb ID varsa, qeydləri yüklə
      if (schoolId) {
        const { data: fetchedEntries, error: entriesError } = await supabase
          .from('data_entries')
          .select('*')
          .eq('school_id', schoolId);
        
        if (entriesError) throw entriesError;
        
        entriesData = fetchedEntries as DataEntry[];
      }
      
      // Kateqoriyaları və sütunları birləşdir
      const categoriesWithColumns = categoriesData.map(category => {
        // Bu kateqoriyaya aid sütunları tap
        const categoryColumns = columnsData?.filter(
          column => column.category_id === category.id
        ) || [];
        
        // Bu kateqoriyaya və məktəbə aid qeydləri tap
        const categoryEntries = entriesData.filter(
          entry => entry.category_id === category.id
        );
        
        // Tamamlanma faizini hesabla
        const completionPercentage = calculateCompletionPercentage(categoryColumns, categoryEntries);
        
        // Kateqoriya statusunu müəyyən et
        const categoryStatus = determineStatus(categoryEntries);
        
        return {
          ...category,
          columns: categoryColumns,
          entries: categoryEntries,
          completionPercentage,
          status: categoryStatus
        } as CategoryWithColumns;
      });
      
      console.log('Categories with columns:', categoriesWithColumns);
      setCategories(categoriesWithColumns);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err.message || 'Kateqoriyaları yükləmək alınmadı');
      toast.error(`Kateqoriyaları yükləmək alınmadı: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [schoolId, columnsQuery]);
  
  // Mount olduqda və ya schoolId dəyişdikdə məlumatları yüklə
  useEffect(() => {
    fetchCategoriesAndColumns();
  }, [fetchCategoriesAndColumns]);
  
  // Məlumatları yeniləmə funksiyası
  const refreshCategories = useCallback(() => {
    return fetchCategoriesAndColumns();
  }, [fetchCategoriesAndColumns]);
  
  return { categories, loading, error, refreshCategories };
};
