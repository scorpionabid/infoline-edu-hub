
import { useState, useCallback } from 'react';
import { CategoryWithColumns } from '@/types/column';
import { useLanguage } from '@/context/LanguageContext';
import { DataEntryForm, ColumnValidationError } from '@/types/dataEntry';

interface UseDataUpdatesProps {
  categories: CategoryWithColumns[];
  formData: DataEntryForm;
  errors: ColumnValidationError[];
  initializeForm: (data: any, status: string) => void;
  validateForm: () => boolean;
  submitForm: () => void;
  setCurrentCategoryIndex: (index: number) => void;
  updateValue: (categoryId: string, columnId: string, value: any) => void;
  saveForm: () => void;
}

export const useDataUpdates = ({
  categories,
  formData,
  errors,
  initializeForm,
  validateForm,
  submitForm,
  setCurrentCategoryIndex,
  updateValue,
  saveForm
}: UseDataUpdatesProps) => {
  const { t } = useLanguage();
  const [isUpdating, setIsUpdating] = useState(false);

  // Kateqoriya dəyişmə metodu
  const changeCategory = useCallback((index: number) => {
    if (categories.length > 0 && index >= 0 && index < categories.length) {
      setCurrentCategoryIndex(index);
      saveForm();
    }
  }, [categories, setCurrentCategoryIndex, saveForm]);

  // Excel dataları ilə form datasını yeniləmə metodu
  const updateFormDataFromExcel = useCallback((data: Record<string, any>, categoryId: string) => {
    if (!categoryId || !data || Object.keys(data).length === 0) return;

    setIsUpdating(true);
    
    try {
      // Mövcud dəyərləri saxlayaq
      const categoryIndex = categories.findIndex(c => c.id === categoryId);
      if (categoryIndex === -1) return;
      
      // Hər bir columnId üçün dəyəri yeniləyək
      Object.entries(data).forEach(([columnId, value]) => {
        updateValue(categoryId, columnId, value);
      });
      
      // Formu validasiya edək
      validateForm();
      
      // Formu saxlayaq
      saveForm();
    } catch (err) {
      console.error('Excel ilə dataları yeniləmə xətası:', err);
    } finally {
      setIsUpdating(false);
    }
  }, [categories, updateValue, validateForm, saveForm]);

  return {
    isUpdating,
    changeCategory,
    updateFormDataFromExcel
  };
};
