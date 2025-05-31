
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CategoryWithColumns } from '@/types/category';

// Keşləmə üçün sabitlər
const CATEGORIES_CACHE_KEY = 'infoline_categories_cache';
const CATEGORIES_CACHE_TIMESTAMP = 'infoline_categories_cache_timestamp';
const CACHE_TTL = 60 * 60 * 1000; // 1 saat (millisaniyələrlə)

interface UseCategoriesResult {
  categories: CategoryWithColumns[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  isCached: boolean;
}

export const useCategories = (initialCategories?: CategoryWithColumns[]): UseCategoriesResult => {
  const [categories, setCategories] = useState<CategoryWithColumns[]>(initialCategories || []);
  const [loading, setLoading] = useState<boolean>(!initialCategories);
  const [error, setError] = useState<Error | null>(null);
  const [isCached, setIsCached] = useState<boolean>(false);

  // Keşdən kategoriyaları oxumaq
  const getCachedCategories = useCallback(() => {
    try {
      const cachedData = sessionStorage.getItem(CATEGORIES_CACHE_KEY);
      const cacheTimestamp = sessionStorage.getItem(CATEGORIES_CACHE_TIMESTAMP);
      
      if (!cachedData || !cacheTimestamp) return null;
      
      const timestamp = parseInt(cacheTimestamp, 10);
      const now = Date.now();
      
      // Keş vaxtı keçmişdirsə, null qaytar
      if (now - timestamp > CACHE_TTL) return null;
      
      return JSON.parse(cachedData) as CategoryWithColumns[];
    } catch (err) {
      console.error('Error reading categories from cache:', err);
      return null;
    }
  }, []);
  
  // Keşə kategoriyaları yazmaq
  const cacheCategories = useCallback((data: CategoryWithColumns[]) => {
    try {
      sessionStorage.setItem(CATEGORIES_CACHE_KEY, JSON.stringify(data));
      sessionStorage.setItem(CATEGORIES_CACHE_TIMESTAMP, Date.now().toString());
    } catch (err) {
      console.error('Error caching categories:', err);
    }
  }, []);

  // Bütün sütunları bir sorğuda gətirmək - performansı artırır
  const fetchAllColumns = useCallback(async (categoryIds: string[]) => {
    if (!categoryIds.length) return {};
    
    try {
      const { data, error } = await supabase
        .from('columns')
        .select('*')
        .in('category_id', categoryIds)
        .order('order_index');
        
      if (error) throw error;
      
      // Kateqoriyalara görə sütunları qruplaşdır
      const columnsByCategory: Record<string, any[]> = {};
      
      data.forEach((column: any) => {
        const categoryId = column.category_id;
        if (!columnsByCategory[categoryId]) columnsByCategory[categoryId] = [];
        
        // Column məlumatlarını emal et
        const processedColumn = {
          ...column,
          options: column.options ? JSON.parse(JSON.stringify(column.options)) : [],
          validation: column.validation ? JSON.parse(JSON.stringify(column.validation)) : {}
        };
        
        columnsByCategory[categoryId].push(processedColumn);
      });
      
      return columnsByCategory;
    } catch (err) {
      console.error('Error fetching all columns:', err);
      return {};
    }
  }, []);

  const fetchCategories = useCallback(async (forceRefresh = false) => {
    // Əgər məcburi yeniləmə istənilmirsə, keşdən yoxla
    if (!forceRefresh) {
      const cachedCategories = getCachedCategories();
      
      if (cachedCategories) {
        console.log('Using cached categories data');
        setCategories(cachedCategories);
        setLoading(false);
        setIsCached(true);
        return;
      }
    }
    
    setLoading(true);
    setError(null);
    setIsCached(false);
    
    try {
      // 1. Kateqoriyaları gətir
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('status', 'active')
        .order('priority', { ascending: false });

      if (error) throw error;
      if (!data || !Array.isArray(data) || data.length === 0) {
        setCategories([]);
        setLoading(false);
        return;
      }
      
      // 2. Bütün kateqoriyaların ID-lərini topla
      const categoryIds = data.map(cat => cat.id);
      
      // 3. Bütün sütunları bir sorğuda gətir
      const columnsByCategory = await fetchAllColumns(categoryIds);
      
      // 4. Kateqoriyaları və sütunları birləşdir
      const categoriesWithColumns: CategoryWithColumns[] = data.map(category => ({
        ...category,
        columns: columnsByCategory[category.id] || []
      }));

      // 5. Nəticələri saxla və keşlə
      setCategories(categoriesWithColumns);
      cacheCategories(categoriesWithColumns);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [getCachedCategories, cacheCategories, fetchAllColumns]);

  useEffect(() => {
    if (!initialCategories) {
      fetchCategories();
    }
  }, [fetchCategories, initialCategories]);

  return { 
    categories, 
    loading, 
    error, 
    refetch: () => fetchCategories(true),
    isCached 
  };
};

export default useCategories;
