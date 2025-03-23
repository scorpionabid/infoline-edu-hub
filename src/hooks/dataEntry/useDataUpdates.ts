
import { useCallback } from 'react';
import { CategoryWithColumns } from '@/types/column';
import { CategoryEntryData, DataEntryForm, ColumnValidationError } from '@/types/dataEntry';

interface UseDataUpdatesProps {
  categories: CategoryWithColumns[];
  formData: DataEntryForm;
  errors: ColumnValidationError[];
  initializeForm: (entries: CategoryEntryData[], status: 'draft' | 'submitted' | 'approved' | 'rejected') => void;
  validateForm: () => void;
  submitForm: (validateFn: () => void) => boolean;
  setCurrentCategoryIndex: (index: number) => void;
}

export const useDataUpdates = ({
  categories,
  formData,
  errors,
  initializeForm,
  validateForm,
  submitForm,
  setCurrentCategoryIndex
}: UseDataUpdatesProps) => {
  
  // Excel əməliyyatları üçün updateFormData funksiyası
  const updateFormDataFromExcel = useCallback((excelData: Record<string, any>, categoryId?: string) => {
    console.log("Excel məlumatları alındı:", excelData);
    
    const newEntries = [...formData.entries];
    
    // Excel-dən alınan məlumatları forma daxil edirik
    Object.entries(excelData).forEach(([columnId, value]) => {
      // Əgər konkret kateqoriya göstərilibsə, yalnız ona aid olan sütunları yeniləyirik
      const category = categoryId 
        ? categories.find(cat => cat.id === categoryId && cat.columns.some(col => col.id === columnId))
        : categories.find(cat => cat.columns.some(col => col.id === columnId));
      
      if (category) {
        const categoryIndex = newEntries.findIndex(entry => entry.categoryId === category.id);
        
        if (categoryIndex !== -1) {
          const valueIndex = newEntries[categoryIndex].values.findIndex(v => v.columnId === columnId);
          
          if (valueIndex !== -1) {
            newEntries[categoryIndex].values[valueIndex] = {
              ...newEntries[categoryIndex].values[valueIndex],
              value,
              status: 'pending'
            };
            
            // Xəta mesajını silirik
            delete newEntries[categoryIndex].values[valueIndex].errorMessage;
          } else {
            newEntries[categoryIndex].values.push({
              columnId,
              value,
              status: 'pending'
            });
          }
        }
      }
    });
    
    // Kateqoriya tamamlanma faizini yeniləmək
    newEntries.forEach(entry => {
      const category = categories.find(c => c.id === entry.categoryId);
      if (category) {
        const requiredColumns = category.columns.filter(col => col.isRequired);
        const filledRequiredValues = entry.values.filter(val => {
          const column = category.columns.find(col => col.id === val.columnId);
          return column?.isRequired && val.value !== '' && val.value !== null && val.value !== undefined;
        });
        
        entry.completionPercentage = requiredColumns.length > 0 
          ? (filledRequiredValues.length / requiredColumns.length) * 100 
          : 100;
        
        entry.isCompleted = entry.completionPercentage === 100;
      }
    });
    
    // Ümumi tamamlanma faizini yeniləmək
    const overallProgress = newEntries.reduce((sum, entry) => sum + entry.completionPercentage, 0) / newEntries.length;
    
    initializeForm(newEntries, formData.status);
    
    // Excel yüklənib bitdikdən sonra formanı validasiya etmək
    setTimeout(() => {
      validateForm();
    }, 500);
  }, [categories, formData.entries, formData.status, initializeForm, validateForm]);

  // Kateqoriya dəyişmək
  const changeCategory = useCallback((index: number) => {
    if (index >= 0 && index < categories.length) {
      setCurrentCategoryIndex(index);
      
      // Kateqoriya dəyişən kimi formanın üstünə scroll etmək
      window.scrollTo(0, 0);
    }
  }, [categories.length, setCurrentCategoryIndex]);

  // Təsdiq üçün göndərmək
  const submitForApproval = useCallback(() => {
    const success = submitForm(validateForm);
    
    if (!success && errors.length > 0) {
      // Xəta olan ilk kateqoriyaya keçid
      const firstErrorIndex = categories.findIndex(cat => 
        cat.columns.some(col => errors.some(err => err.columnId === col.id))
      );
      
      if (firstErrorIndex !== -1) {
        setCurrentCategoryIndex(firstErrorIndex);
      }
    }
  }, [submitForm, validateForm, errors, categories, setCurrentCategoryIndex]);

  return {
    updateFormDataFromExcel,
    changeCategory,
    submitForApproval
  };
};
