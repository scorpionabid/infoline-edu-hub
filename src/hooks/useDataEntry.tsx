import { useCallback } from 'react';
import { Category } from '@/types/category';
import { useDataEntries } from './useDataEntries';
import { useAuth } from '@/context/AuthContext';
import { useCategoryData } from './dataEntry/useCategoryData';
import { useColumnData } from './dataEntry/useColumnData';
import { useDataEntryState } from './dataEntry/useDataEntryState';
import { useDataEntryActions } from './dataEntry/useDataEntryActions';
import { useDataEntryUtils } from './dataEntry/useDataEntryUtils';

export interface CategoryWithData extends Category {
  columns: import('@/types/column').Column[];
}

export const useDataEntry = (categoryId?: string, schoolId?: string) => {
  const { user } = useAuth();

  // Məlumatları əldə etmək üçün alt hook-lar
  const {
    entries,
    loading: entriesLoading,
    error: entriesError,
    fetchEntries,
    addEntry,
    updateEntry,
    deleteEntry,
    approveEntry: approveEntryFn,
    rejectEntry: rejectEntryFn,
    submitCategoryForApproval: submitCategoryForApprovalFn,
    getApprovalStatus: getApprovalStatusFn
  } = useDataEntries();

  // Submitı əlavə edək
  const submitCategoryForApproval = useCallback(async (categoryId: string, schoolId: string) => {
    if (submitCategoryForApprovalFn) {
      return submitCategoryForApprovalFn(categoryId, schoolId);
    }
    try {
      console.log(`Category ${categoryId} for school ${schoolId} submitted for approval`);
      return true;
    } catch (error) {
      console.error('Kateqoriya təsdiqi zamanı xəta:', error);
      return false;
    }
  }, [submitCategoryForApprovalFn]);

  // Kateqoriya məlumatları ilə bağlı vəziyyət və əməliyyatlar
  const {
    category,
    loading,
    error,
    fetchCategoryData
  } = useCategoryData(categoryId);

  // Sütunlarla bağlı vəziyyət və əməliyyatlar
  const {
    columns,
    filteredColumns,
    setColumns,
    setFilteredColumns
  } = useColumnData();

  // Məlumat daxiletmə vəziyyəti
  const {
    dataEntries,
    categoryStatus,
    unsavedChanges,
    submitting,
    loadingEntries,
    categories,
    currentCategoryIndex,
    formData,
    isAutoSaving,
    errors,
    isReady,
    setDataEntries,
    setCategoryStatus,
    setUnsavedChanges,
    setSubmitting,
    setLoadingEntries,
    setCategories,
    setCurrentCategoryIndex,
    setFormData,
    setIsAutoSaving,
    setErrors,
    setIsReady
  } = useDataEntryState();

  // Məlumat daxiletmə əməliyyatları
  const {
    handleDataChange,
    handleSubmitForApproval,
    fetchDataEntriesForCategory
  } = useDataEntryActions({
    categoryId,
    schoolId,
    user,
    dataEntries,
    setDataEntries,
    setCategoryStatus,
    setUnsavedChanges,
    setSubmitting,
    entries,
    submitCategoryForApproval,
    columns,
    setLoadingEntries,
    setIsAutoSaving,
    setFormData
  });

  // Köməkçi funksiyalar
  const {
    changeCategory,
    saveForm,
    getErrorForColumn,
    downloadExcelTemplate,
    uploadExcelData
  } = useDataEntryUtils({
    categories,
    setCurrentCategoryIndex
  });

  // Kateqoriya məlumatlarını yüklə
  const refreshData = useCallback(() => {
    console.log('Məlumatlar yenilənir... CategoryID:', categoryId);
    if (categoryId) {
      fetchCategoryData();
      
      // Məlumatlar hazır olduqda fetchDataEntriesForCategory() çağrılacaq
      // Bu əlavə məlumatları yükləmə prosesini optimallaşdırmaq üçündür
      if (!entriesLoading) {
        fetchDataEntriesForCategory();
      }
    } else {
      console.warn('categoryId təyin edilməyib');
    }
    
    // Component-in hazır olduğunu bildir
    setIsReady(true);
  }, [categoryId, fetchCategoryData, entriesLoading, fetchDataEntriesForCategory, setIsReady]);

  return {
    // Vəziyyət
    category,
    columns,
    filteredColumns,
    dataEntries,
    loading,
    loadingEntries,
    submitting,
    categoryStatus,
    error: error || entriesError,
    unsavedChanges,
    categories,
    currentCategoryIndex,
    formData,
    isAutoSaving,
    isSubmitting: submitting,
    isLoading: loading,
    isReady,
    errors,
    
    // Əməliyyatlar
    handleDataChange,
    handleSubmitForApproval,
    refreshData,
    changeCategory,
    updateValue: handleDataChange,
    submitForApproval: handleSubmitForApproval,
    saveForm,
    getErrorForColumn,
    downloadExcelTemplate,
    uploadExcelData,
    submitCategoryForApproval,
    
    // Əlavə edilən metodlar
    approveEntry: approveEntryFn || updateEntry,
    rejectEntry: rejectEntryFn || updateEntry,
    submitCategoryForApproval,
    getApprovalStatus: getApprovalStatusFn || ((id: string) => "pending")
  };
};

export default useDataEntry;
