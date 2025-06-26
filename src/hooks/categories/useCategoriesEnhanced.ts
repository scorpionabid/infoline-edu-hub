
import useCategoriesQuery from "./useCategoriesQuery";
import { useMemo } from 'react';
import { Category } from '@/types/category';

export function useCategoriesEnhanced() {
  const { categories: rawCategories, isLoading, error, refetch } = useCategoriesQuery();
  
  const categories = useMemo(() => {
    if (!rawCategories) return [];
    
    // Normalize column counts and other fields
    return rawCategories.map((category: Category) => ({
      ...category,
      columnCount: category.column_count,
      completion_rate: category.completion_rate || 0, // Handle missing completion_rate
      completionRate: category.completion_rate || category.completionRate || 0
    }));
  }, [rawCategories]);
  
  return {
    categories,
    isLoading,
    error,
    // refetch
  };
}

export default useCategoriesEnhanced;
