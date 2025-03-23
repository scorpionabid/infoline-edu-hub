
import { useState, useRef } from 'react';
import { CategoryWithColumns } from '@/types/column';
import { mockCategories } from '@/data/mockCategories';

export const useDataEntryState = (selectedCategoryId: string | null) => {
  const [categories, setCategories] = useState<CategoryWithColumns[]>(mockCategories);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // URL-də dəyişiklik olduqda category-nin yenilənməsi üçün ref
  const lastCategoryIdRef = useRef<string | null>(selectedCategoryId);

  return {
    categories,
    setCategories,
    currentCategoryIndex,
    setCurrentCategoryIndex,
    isLoading,
    setIsLoading,
    lastCategoryIdRef
  };
};
