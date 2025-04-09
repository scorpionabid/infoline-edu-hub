import { useState, useCallback, useEffect, useRef } from 'react';
import { CategoryWithColumns } from '@/types/column';
import { useCategoryData } from './useCategoryData';

interface UseDataEntryStateProps {
  initialCategoryId?: string;
}

export const useDataEntryState = ({ initialCategoryId }: UseDataEntryStateProps = {}) => {
  const { categories, isLoading, error } = useCategoryData();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const categoryIdRef = useRef<string | null>(initialCategoryId || null);

  // Kateqoriya indeksini dəyişmək üçün metod
  const setCategoryIndex = useCallback((index: number) => {
    if (index >= 0 && index < categories.length) {
      setCurrentIndex(index);
      if (categories[index]) {
        categoryIdRef.current = categories[index].id;
      }
    }
  }, [categories]);

  // İlkin kateqoriya ID-si varsa, onu tapıb indeksini təyin edirik
  useEffect(() => {
    if (!isLoading && categories.length > 0) {
      if (categoryIdRef.current) {
        const categoryIndex = categories.findIndex(c => c.id === categoryIdRef.current);
        if (categoryIndex !== -1) {
          setCurrentIndex(categoryIndex);
        } else {
          // Əgər ID-yə uyğun kateqoriya tapılmasa, ilk kateqoriyanı seçirik
          setCurrentIndex(0);
          categoryIdRef.current = categories[0].id;
        }
      } else {
        // Əgər heç bir ID təyin edilməyibsə, ilk kateqoriyanı seçirik
        categoryIdRef.current = categories[0].id;
      }
    }
  }, [categories, isLoading]);

  // Kateqoriya datalarını yeniləmək üçün metod
  const fetchCategoryData = useCallback(async () => {
    // useCategoryData hook-u tərəfindən avtomatik yenilənir,
    // lakin əl ilə yeniləmək üçün bu metodu təqdim edirik
    // Gələcəkdə burada yeniləmə üçün əlavə məntiq qoşa bilərik
  }, []);

  return {
    categories,
    isLoading,
    error,
    currentIndex,
    setCategoryIndex,
    categoryIdRef,
    fetchCategoryData
  };
};
