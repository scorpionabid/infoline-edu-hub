// Data loading management for data entry
import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CategoryWithColumns } from '@/types/category';
import { DataEntry } from '@/types/dataEntry';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import useCacheManager from './useCacheManager';

interface UseDataLoaderOptions {
  categoryId: string;
  schoolId: string;
  useCache?: boolean;
  maxRetries?: number;
  timeout?: number;
}

export const useDataLoader = ({
  categoryId,
  schoolId,
  useCache = true,
  maxRetries = 3,
  timeout = 30000
}: UseDataLoaderOptions) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  // Cache management
  const cache = useCacheManager({ categoryId, schoolId });
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Tracking refs to prevent infinite loops
  const isDataLoaded = useRef<boolean>(false);
  const loadAttempts = useRef<number>(0);
  const lastLoadTime = useRef<number>(0);
  
  // Load categories with columns
  const loadCategories = useCallback(async (): Promise<CategoryWithColumns[]> => {
    try {
      setError(null);
      
      // Check cache first
      if (useCache) {
        const cached = cache.getCachedData('categories');
        if (cached) {
          console.log('Using cached categories');
          return cached;
        }
      }
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('priority', { ascending: true });
      
      if (error) throw error;
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        return [];
      }
      
      // Load columns for each category
      const categoriesWithColumns: CategoryWithColumns[] = [];
      
      for (const category of data) {
        if (!category || !category.id) continue;
        
        try {
          const { data: columns, error: columnsError } = await supabase
            .from('columns')
            .select('*')
            .eq('category_id', category.id)
            .order('order_index', { ascending: true });
          
          if (columnsError) throw columnsError;
          
          categoriesWithColumns.push({
            ...category,
            columns: columns || []
          });
        } catch (err) {
          console.error(`Error loading columns for category ${category.id}:`, err);
          categoriesWithColumns.push({
            ...category,
            columns: []
          });
        }
      }
      
      // Cache the result
      if (useCache) {
        cache.setCachedData(categoriesWithColumns, 'categories');
      }
      
      return categoriesWithColumns;
    } catch (err: any) {
      console.error('Error loading categories:', err);
      throw new Error(err.message || 'Failed to load categories');
    }
  }, [useCache, cache]);
  
  // Load data entries for category and school
  const loadEntries = useCallback(async (
    targetSchoolId?: string,
    targetCategoryId?: string,
    forceRefresh = false
  ): Promise<{ data: Record<string, any>; entries: DataEntry[] }> => {
    const finalSchoolId = targetSchoolId || schoolId;
    const finalCategoryId = targetCategoryId || categoryId;
    
    if (!finalSchoolId || !finalCategoryId) {
      throw new Error('School ID and Category ID are required');
    }
    
    // Throttle frequent requests
    const now = Date.now();
    if (!forceRefresh && now - lastLoadTime.current < 2000) {
      console.log('Throttling data load - too frequent requests');
      throw new Error('Request throttled');
    }
    lastLoadTime.current = now;
    
    // Check max attempts
    loadAttempts.current += 1;
    if (loadAttempts.current > maxRetries && !forceRefresh) {
      throw new Error('Max load attempts exceeded');
    }
    
    try {
      setError(null);
      
      // Check cache first
      if (useCache && !forceRefresh) {
        const cacheKey = `entries_${finalSchoolId}_${finalCategoryId}`;
        const cached = cache.getCachedData(cacheKey);
        if (cached) {
          console.log('Using cached entries');
          return cached;
        }
      }
      
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Data loading timeout after ${timeout/1000} seconds`));
        }, timeout);
      });
      
      // Load from database
      const dataPromise = supabase
        .from('data_entries')
        .select('id, column_id, value, status, school_id, category_id, created_at, updated_at')
        .eq('school_id', finalSchoolId)
        .eq('category_id', finalCategoryId);

      const { data, error } = await Promise.race([dataPromise, timeoutPromise]);

      if (error) throw error;

      console.log(`Loaded ${data?.length || 0} entries for category ${finalCategoryId}`);

      // Convert to form data
      const formData: Record<string, string> = {};
      const typedEntries: DataEntry[] = [];
      
      if (data && Array.isArray(data)) {
        data.forEach(entry => {
          if (entry && entry.column_id && entry.value !== null && entry.value !== undefined) {
            formData[entry.column_id] = String(entry.value);
            
            typedEntries.push({
              ...entry,
              school_id: entry.school_id || finalSchoolId,
              category_id: entry.category_id || finalCategoryId,
              created_at: entry.created_at || new Date().toISOString(),
              updated_at: entry.updated_at || new Date().toISOString()
            });
          }
        });
      }
      
      const result = { data: formData, entries: typedEntries };
      
      // Cache the result
      if (useCache) {
        const cacheKey = `entries_${finalSchoolId}_${finalCategoryId}`;
        cache.setCachedData(result, cacheKey);
      }
      
      // Mark as loaded and reset attempts
      isDataLoaded.current = true;
      loadAttempts.current = 0;
      
      return result;
    } catch (err: any) {
      console.error('Error loading entries:', err);
      throw err;
    }
  }, [schoolId, categoryId, useCache, cache, maxRetries, timeout]);
  
  // Load data with automatic retry and loading state management
  const loadData = useCallback(async (
    targetSchoolId?: string,
    targetCategoryId?: string,
    forceRefresh = false
  ): Promise<{ data: Record<string, any>; entries: DataEntry[] } | null> => {
    const finalSchoolId = targetSchoolId || schoolId;
    const finalCategoryId = targetCategoryId || categoryId;
    
    if (!finalSchoolId || !finalCategoryId) {
      console.log('Skipping data load - missing required IDs');
      return null;
    }
    
    if (isLoading && !forceRefresh) {
      console.log('Already loading data - skipping duplicate request');
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await loadEntries(finalSchoolId, finalCategoryId, forceRefresh);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load data';
      setError(errorMessage);
      
      if (forceRefresh) {
        toast({
          title: t('error'),
          description: errorMessage,
          variant: 'destructive'
        });
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [schoolId, categoryId, isLoading, loadEntries, t, toast]);
  
  // Clear cache and reload
  const refreshData = useCallback(async (
    targetSchoolId?: string,
    targetCategoryId?: string
  ) => {
    // Clear relevant cache
    if (useCache) {
      const finalSchoolId = targetSchoolId || schoolId;
      const finalCategoryId = targetCategoryId || categoryId;
      cache.removeCachedData(`entries_${finalSchoolId}_${finalCategoryId}`);
    }
    
    // Reset loading state
    isDataLoaded.current = false;
    loadAttempts.current = 0;
    
    // Reload data
    return loadData(targetSchoolId, targetCategoryId, true);
  }, [useCache, schoolId, categoryId, cache, loadData]);
  
  return {
    // State
    isLoading,
    error,
    isDataLoaded: isDataLoaded.current,
    
    // Actions
    loadCategories,
    loadEntries,
    loadData,
    refreshData,
    
    // Cache utilities
    clearCache: cache.clearCache,
    cacheStats: cache.getCacheStats()
  };
};

export default useDataLoader;
