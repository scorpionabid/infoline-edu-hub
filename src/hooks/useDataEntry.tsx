
import { useState, useCallback, useEffect, useRef } from 'react';
import { CategoryWithColumns } from '@/types/column';
import { toast } from '@/components/ui/use-toast';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useForm } from '@/hooks/form';
import { useValidation } from '@/hooks/useValidation';
import { useExcelOperations } from '@/hooks/useExcelOperations';
import { useCategoryData } from '@/hooks/dataEntry/useCategoryData';
import { useDataEntryState } from '@/hooks/dataEntry/useDataEntryState';
import { useDataUpdates } from '@/hooks/dataEntry/useDataUpdates';

export const useDataEntry = (initialCategoryId?: string | null) => {
  const { t } = useLanguage();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const urlCategoryId = queryParams.get('categoryId');
  // Prioritize function parameter over URL parameter
  const selectedCategoryId = initialCategoryId || urlCategoryId;
  
  const { 
    categories, 
    setCategories, 
    isLoading, 
    setIsLoading, 
    currentCategoryIndex, 
    setCurrentCategoryIndex, 
    lastCategoryIdRef
  } = useDataEntryState(selectedCategoryId);

  // Form hook və validasiya
  const { 
    formData, 
    isAutoSaving, 
    isSubmitting, 
    updateValue, 
    saveForm, 
    submitForm, 
    setupAutoSave,
    initializeForm 
  } = useForm(categories);
  
  const { errors, validateForm, getErrorForColumn } = useValidation(categories, formData.entries);
  
  // Kateqoriya dəyişikliyinin izlənməsi və məlumatların yüklənməsi
  const { loadCategoryData } = useCategoryData({
    selectedCategoryId,
    lastCategoryIdRef,
    setIsLoading,
    setCategories,
    setCurrentCategoryIndex,
    initializeForm,
    validateForm,
    queryParams
  });

  // Məlumatların yenilənməsi ilə bağlı funksionallar - əlavə parametrlər ötürürük
  const { updateFormDataFromExcel, changeCategory, submitForApproval } = useDataUpdates({
    categories,
    formData,
    errors,
    initializeForm,
    validateForm,
    submitForm,
    setCurrentCategoryIndex,
    updateValue,  // Yeni əlavə
    saveForm      // Yeni əlavə
  });

  const { downloadExcelTemplate, uploadExcelData } = useExcelOperations(categories, updateFormDataFromExcel);
  
  // Auto saxlama ilə validasiya əlaqəsi
  useEffect(() => {
    return setupAutoSave(validateForm);
  }, [setupAutoSave, validateForm]);

  // İlkin məlumatların yüklənməsi - veriləcək loq mesajını sadələşdiririk
  useEffect(() => {
    loadCategoryData();
  }, [loadCategoryData]);

  return {
    categories,
    currentCategoryIndex,
    formData,
    isAutoSaving,
    isSubmitting,
    isLoading,
    errors,
    changeCategory,
    updateValue,
    submitForApproval,
    saveForm,
    getErrorForColumn: (columnId: string) => getErrorForColumn(columnId, formData.entries.flatMap(e => e.values)),
    downloadExcelTemplate,
    uploadExcelData
  };
};
