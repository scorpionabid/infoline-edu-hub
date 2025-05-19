
import useCategoriesQuery from "./useCategoriesQuery";
import { useMemo } from 'react';
import { Category } from '@/types/category';

export function useCategoriesEnhanced() {
  const { data, isLoading, error, refetch } = useCategoriesQuery();
  
  const categories = useMemo(() => {
    if (!data) return [];
    
    // Normalize column counts and other fields
    return data.map((category: Category) => ({
      ...category,
      columnCount: category.column_count,
      completionRate: category.completionRate || 0
    }));
  }, [data]);
  
  return {
    categories,
    isLoading,
    error,
    refetch
  };
}

export default useCategoriesEnhanced;
