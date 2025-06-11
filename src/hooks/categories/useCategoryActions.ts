
import { useState, useCallback } from 'react';
import { Category } from '@/types/category';

export const useCategoryActions = () => {
  const [categories] = useState<Category[]>([]);
  const [isLoading] = useState(false);

  const createCategory = useCallback(async (categoryData: Partial<Category>): Promise<Category> => {
    // Mock implementation
    return {} as Category;
  }, []);

  const updateCategory = useCallback(async (id: string, categoryData: Partial<Category>): Promise<Category> => {
    // Mock implementation
    return {} as Category;
  }, []);

  const deleteCategory = useCallback(async (id: string): Promise<void> => {
    // Mock implementation
  }, []);

  return {
    categories,
    isLoading,
    createCategory,
    updateCategory,
    deleteCategory
  };
};

export default useCategoryActions;
