
import { useState, useCallback, useEffect, useRef } from 'react';
import { CategoryWithColumns } from '@/types/column';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useForm } from '@/hooks/form';
import { useValidation } from '@/hooks/useValidation';
import { useExcelOperations } from '@/hooks/useExcelOperations';
import { useCategoryData } from '@/hooks/dataEntry/useCategoryData';
import { useDataUpdates } from '@/hooks/dataEntry/useDataUpdates';
import { useDataEntryState } from '@/hooks/dataEntry/useDataEntryState';

export const useDataEntry = (initialCategoryId?: string | null) => {
  const { t } = useLanguage();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const urlCategoryId = queryParams.get('categoryId');
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

  const { updateFormDataFromExcel, changeCategory, submitForApproval } = useDataUpdates({
    categories,
    formData,
    errors,
    initializeForm,
    validateForm,
    submitForm,
    setCurrentCategoryIndex,
    updateValue,
    saveForm
  });

  const { downloadExcelTemplate, uploadExcelData } = useExcelOperations(categories, updateFormDataFromExcel);
  
  useEffect(() => {
    return setupAutoSave(validateForm);
  }, [setupAutoSave, validateForm]);

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
    getErrorForColumn: (columnId: string) => getErrorForColumn(columnId),
    downloadExcelTemplate,
    uploadExcelData
  };
};
