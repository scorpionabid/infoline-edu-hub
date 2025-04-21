
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth';
import { useLanguage } from '@/context/LanguageContext';
import { DataEntrySaveStatus, UseDataEntryProps } from '@/types/dataEntry';
import { useDataEntryCategories } from './useDataEntryCategories';
import { useDataEntryEntries } from './useDataEntryEntries';
import { useDataEntryForm } from './useDataEntryForm';
import { useDataEntrySave } from './useDataEntrySave';

export const useDataEntry = ({
  schoolId,
  categoryId,
  onComplete
}: UseDataEntryProps) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [saveStatus, setSaveStatus] = useState<DataEntrySaveStatus>(DataEntrySaveStatus.IDLE);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const {
    categories,
    selectedCategory,
    setSelectedCategory,
    loading,
    error,
    loadCategories,
  } = useDataEntryCategories(categoryId);

  const {
    entries,
    setEntries,
    isDataModified,
    setIsDataModified,
    loadDataForSchool,
    handleEntriesChange,
  } = useDataEntryEntries();

  const {
    formData,
    setFormData,
    updateFormData,
  } = useDataEntryForm(schoolId, categoryId);

  const { handleSave, handleSubmitForApproval } = useDataEntrySave(
    formData,
    schoolId,
    categoryId,
    user,
    loadDataForSchool,
    t,
    onComplete
  );

  // Kategoriyalar və entry-lər yüklə
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (schoolId) {
      loadDataForSchool(schoolId);
    }
  }, [schoolId, loadDataForSchool]);

  useEffect(() => {
    if (categories.length > 0 && categoryId) {
      const category = categories.find(c => c.id === categoryId);
      setSelectedCategory(category);
    }
  }, [categories, categoryId, setSelectedCategory]);

  // Wrapperlar: handleSave və handleSubmitForApproval
  const handleSaveWrapper = useCallback(async () => {
    await handleSave(setSaveStatus, setIsDataModified);
  }, [handleSave, setSaveStatus, setIsDataModified]);

  const handleSubmitForApprovalWrapper = useCallback(async () => {
    await handleSubmitForApproval(handleSaveWrapper, setSubmitting);
  }, [handleSubmitForApproval, handleSaveWrapper, setSubmitting]);

  return {
    formData,
    updateFormData,
    categories,
    selectedCategory,
    loading,
    submitting,
    handleEntriesChange,
    handleSave: handleSaveWrapper,
    handleSubmitForApproval: handleSubmitForApprovalWrapper,
    loadDataForSchool,
    entries,
    saveStatus,
    isDataModified,
    error
  };
};
