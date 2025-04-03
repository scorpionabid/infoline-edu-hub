
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
    submitCategoryForApproval
  } = useDataEntries();

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
    setDataEntries,
    setCategoryStatus,
    setUnsavedChanges,
    setSubmitting,
    setLoadingEntries,
    setCategories,
    setCurrentCategoryIndex,
    setFormData,
    setIsAutoSaving,
    setErrors
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
    setFormData,
    columns
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
    fetchCategoryData();
    if (!entriesLoading) {
      fetchDataEntriesForCategory();
    }
  }, [fetchCategoryData, entriesLoading, fetchDataEntriesForCategory]);

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
    uploadExcelData
  };
};

export default useDataEntry;
