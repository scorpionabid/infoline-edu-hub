
import { useState, useCallback } from 'react';

export interface UseDataLoaderOptions {
  categoryId: string;
  schoolId: string;
}

export interface UseDataLoaderResult {
  isLoading: boolean;
  error: string | null;
  loadData: (schoolId?: string, categoryId?: string, forceRefresh?: boolean) => Promise<any>;
  refreshData: (schoolId: string, categoryId: string) => Promise<void>;
  loadCategories: () => Promise<any>;
}

export const useDataLoader = ({
  categoryId,
  schoolId
}: UseDataLoaderOptions): UseDataLoaderResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (
    loadSchoolId?: string, 
    loadCategoryId?: string, 
    forceRefresh?: boolean
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Mock data loading
      console.log('Loading data for:', { 
        schoolId: loadSchoolId || schoolId, 
        categoryId: loadCategoryId || categoryId,
        forceRefresh 
      });
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        data: {},
        entries: []
      };
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, schoolId]);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Loading categories for school:', schoolId);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return {
        categories: []
      };
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [schoolId]);

  const refreshData = useCallback(async (refreshSchoolId: string, refreshCategoryId: string) => {
    await loadData(refreshSchoolId, refreshCategoryId, true);
  }, [loadData]);

  return {
    isLoading,
    error,
    loadData,
    refreshData,
    loadCategories
  };
};

export default useDataLoader;
