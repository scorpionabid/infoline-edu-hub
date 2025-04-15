
import { useCallback } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { CategoryEntryData } from '@/types/dataEntry';

interface UseDataUpdatesProps {
  categories: any[];
  formData: any;
  validationErrors: any[];
  initializeForm: (entries: any[], status: string) => void;
  validateAllEntries: (entries: any[], columns: Record<string, any>) => boolean;
  submitForm: () => void;
  setCurrentCategoryIndex: (index: number) => void;
  updateValue: (categoryId: string, columnId: string, value: any) => void;
  saveForm: () => void;
}

/**
 * @description Məlumat yeniləmələrini idarə etmək üçün hook
 */
export const useDataUpdates = ({
  categories,
  formData,
  validationErrors,
  initializeForm,
  validateAllEntries,
  submitForm,
  setCurrentCategoryIndex,
  updateValue,
  saveForm
}: UseDataUpdatesProps) => {
  const { t } = useLanguage();
  
  // Excel-dən məlumatları yeniləmək üçün funksiya
  const updateFormDataFromExcel = useCallback((data: Record<string, any>, categoryId: string) => {
    try {
      // Yalnız bir kateqoriya üçün dəyişiklikləri tətbiq et
      Object.entries(data).forEach(([columnId, value]) => {
        updateValue(categoryId, columnId, value);
      });
      
      saveForm();
      
      toast.success(t('excelDataImported'), {
        description: t('excelImportSuccess')
      });
    } catch (error) {
      console.error('Excel data update error:', error);
      toast.error(t('excelImportError'), {
        description: t('excelImportFailed')
      });
    }
  }, [updateValue, saveForm, t]);
  
  // Kateqoriyanı dəyişmək üçün funksiya
  const changeCategory = useCallback((index: number) => {
    // Mövcud dəyişiklikləri saxla
    saveForm();
    
    // Yeni kateqoriyaya keç
    setCurrentCategoryIndex(index);
  }, [saveForm, setCurrentCategoryIndex]);
  
  return {
    updateFormDataFromExcel,
    changeCategory
  };
};
