
import { useState, useRef, useCallback } from 'react';
import { CategoryWithColumns } from '@/types/column';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { ColumnValidationError } from '@/types/dataEntry';

// Validasiya xətalarını idarə edən funksiya
export const handleValidationError = (errors: ColumnValidationError[]) => {
  const { t } = useLanguage();
  
  toast.error(t("validationErrors"), {
    description: `${errors.length} ${t("errorsFound")}`
  });
};

// Data entry vəziyyətini idarə edən hook
export const useDataEntryState = (selectedCategoryId?: string | null) => {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<CategoryWithColumns[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const lastCategoryIdRef = useRef<string | null>(null);
  
  // Kateqoriya məlumatlarını sıfırlamaq üçün funksiya
  const resetCategories = useCallback(() => {
    setCategories([]);
    setIsLoading(true);
    setCurrentCategoryIndex(0);
  }, []);

  return {
    categories,
    setCategories,
    isLoading,
    setIsLoading,
    currentCategoryIndex,
    setCurrentCategoryIndex,
    lastCategoryIdRef,
    resetCategories
  };
};
