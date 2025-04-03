
import { useState, useEffect, useCallback } from 'react';
import { Category } from '@/types/category';

export const useCategoryData = (categoryId?: string) => {
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategoryData = useCallback(async () => {
    if (!categoryId) return;

    setLoading(true);
    try {
      const mockCategory: Category = {
        id: categoryId,
        name: 'Demo Kategoria',
        description: 'Demo kateqoriya təsviri',
        assignment: 'all',
        priority: 1,
        deadline: new Date().toISOString(),
        status: 'active',
        columnCount: 5,
        order: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setCategory(mockCategory);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Kateqoriya məlumatlarını əldə edərkən xəta baş verdi'));
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchCategoryData();
  }, [fetchCategoryData]);

  return {
    category,
    loading,
    error,
    fetchCategoryData,
    setCategory
  };
};
