
import { useState, useCallback } from 'react';

export interface UseDataLoaderOptions {
  categoryId: string;
  schoolId: string;
}

export interface UseDataLoaderResult {
  isLoading: boolean;
  error: string | null;
  loadData: () => Promise<void>;
}

export const useDataLoader = ({
  categoryId,
  schoolId
}: UseDataLoaderOptions): UseDataLoaderResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Mock data loading
      console.log('Loading data for:', { categoryId, schoolId });
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, schoolId]);

  return {
    isLoading,
    error,
    loadData
  };
};

export default useDataLoader;
