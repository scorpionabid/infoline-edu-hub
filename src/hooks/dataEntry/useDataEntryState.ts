
import { useState, useCallback, useEffect, useRef } from 'react';
import { Column } from '@/types/column';
import { useCategoryData } from './useCategoryData';

interface CategoryWithColumns {
  id: string;
  name: string;
  columns: Column[];
  [key: string]: any;
}

interface UseDataEntryStateProps {
  initialCategoryId?: string;
}

/**
 * @description Məlumat giriş vəziyyətini idarə etmək üçün hook
 */
export const useDataEntryState = ({ initialCategoryId }: UseDataEntryStateProps) => {
  const { categories, loading, error, refetch } = useCategoryData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const categoryIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Kateqoriyalar yükləndikdən sonra, başlanğıc kateqoriyasını təyin et
    if (!loading && categories.length > 0) {
      if (initialCategoryId) {
        const index = categories.findIndex(c => c.id === initialCategoryId);
        if (index !== -1) {
          setCurrentIndex(index);
          categoryIdRef.current = initialCategoryId;
        } else {
          setCurrentIndex(0);
          categoryIdRef.current = categories[0].id;
        }
      } else {
        setCurrentIndex(0);
        categoryIdRef.current = categories[0].id;
      }
    }
  }, [categories, loading, initialCategoryId]);

  // Kateqoriya indeksini təyin etmək üçün funksiya
  const setCategoryIndex = useCallback((index: number) => {
    if (index >= 0 && index < categories.length) {
      setCurrentIndex(index);
      categoryIdRef.current = categories[index].id;
    }
  }, [categories]);

  // Kateqoriya məlumatlarını əldə etmək üçün funksiya
  const fetchCategoryData = useCallback(async () => {
    // Bu funksiya useCategoryData hook-undan gələn dataları istifadə edir
    // Burada əlavə bir şey etməyə ehtiyac yoxdur
    return Promise.resolve();
  }, []);

  return {
    categories,
    isLoading: loading,
    error,
    currentIndex,
    setCategoryIndex,
    categoryIdRef,
    fetchCategoryData
  };
};
