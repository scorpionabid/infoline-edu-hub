
import { useCallback } from 'react';
import { CategoryWithColumns } from '@/types/column';
import { CategoryEntryData } from '@/types/dataEntry';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

interface UseDataUpdatesProps {
  categories: CategoryWithColumns[];
  formData: {
    entries: CategoryEntryData[];
    lastSaved?: string;
    overallProgress: number;
    status: 'draft' | 'submitted' | 'approved' | 'rejected';
  };
  errors: Record<string, string>;
  initializeForm: (entries: CategoryEntryData[], status: string) => void;
  validateForm: () => boolean;
  submitForm: () => Promise<void>;
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

  // Kateqoriyanı dəyişdirmək metodu
  const changeCategory = useCallback((index: number) => {
    if (index >= 0 && index < categories.length) {
      setCurrentCategoryIndex(index);
      saveForm(); // Kateqoriya dəyişdikdə əvvəlki kateqoriyanın məlumatlarını saxla
    }
  }, [categories, setCurrentCategoryIndex, saveForm]);

  // Excel faylından məlumatları formanı yeniləmək metodu
  const updateFormDataFromExcel = useCallback((data: Record<string, any>, categoryId: string) => {
    try {
      const categoryIndex = categories.findIndex(c => c.id === categoryId);
      if (categoryIndex === -1) {
        toast.error(t('categoryNotFound'));
        return;
      }

      const category = categories[categoryIndex];
      
      // Cari kateqoriya üçün mövcud giriş məlumatlarını tapmaq
      let existingEntryIndex = formData.entries.findIndex(e => e.categoryId === categoryId);
      const newValues = [];
      
      // Excel datası əsasında sütunları yeniləyək
      for (const [columnId, value] of Object.entries(data)) {
        // Sütunun cari kateqoriyaya aid olduğunu yoxlayırıq
        const column = category.columns.find(c => c.id === columnId);
        if (column) {
          newValues.push({
            columnId,
            value,
            status: 'pending' as 'pending' | 'approved' | 'rejected'
          });
          
          // Sütun dəyərini birbaşa yeniləyək
          updateValue(categoryId, columnId, value);
        }
      }
      
      // Formada dəyişiklikləri saxla
      saveForm();
      
      // Kateqoriyanı aktiv et
      setCurrentCategoryIndex(categoryIndex);
      
    } catch (error) {
      console.error('Excel ilə məlumatları yeniləyərkən xəta:', error);
      toast.error(t('errorUpdatingExcelData'));
    }
  }, [categories, formData.entries, updateValue, saveForm, setCurrentCategoryIndex, t]);

  return {
    changeCategory,
    updateFormDataFromExcel
  };
};
