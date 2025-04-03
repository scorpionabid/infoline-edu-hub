
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { DataEntry } from '@/types/dataEntry';
import { Column } from '@/types/category';

export interface UseDataEntryActionsProps {
  categoryId?: string;
  schoolId?: string;
  user: any;
  dataEntries: { [columnId: string]: string };
  setDataEntries: React.Dispatch<React.SetStateAction<{ [columnId: string]: string }>>;
  setCategoryStatus: React.Dispatch<React.SetStateAction<string>>;
  setUnsavedChanges: React.Dispatch<React.SetStateAction<boolean>>;
  setSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  entries: DataEntry[];
  submitCategoryForApproval: (categoryId: string, schoolId: string) => Promise<boolean>;
  columns: Column[];
  setLoadingEntries: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAutoSaving: React.Dispatch<React.SetStateAction<boolean>>;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export const useDataEntryActions = ({
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
}: UseDataEntryActionsProps) => {
  const { t } = useLanguage();
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const fetchDataEntriesForCategory = useCallback(() => {
    // Implement logic to fetch data entries for the current category
    // and update the dataEntries state
    console.log('Fetching data entries for category:', categoryId);
  }, [categoryId]);

  const handleDataChange = useCallback((columnId: string, value: string) => {
    setDataEntries(prev => ({
      ...prev,
      [columnId]: value
    }));
    setUnsavedChanges(true);

    // Auto-save logic
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    const timer = setTimeout(() => {
      setIsAutoSaving(true);
      // Implement your auto-save logic here, e.g., calling an API
      console.log('Auto-saving data...');
      setIsAutoSaving(false);
    }, 3000); // Auto-save after 3 seconds

    setAutoSaveTimer(timer);
  }, [setDataEntries, setUnsavedChanges, setIsAutoSaving, autoSaveTimer]);

  const handleSubmitForApproval = useCallback(async () => {
    setSubmitting(true);
    setErrors({});
    try {
      // Validate required fields
      const newErrors: { [key: string]: string } = {};
      columns.forEach(column => {
        if (column.isRequired && !dataEntries[column.id]) {
          newErrors[column.id] = t('requiredField');
        }
      });

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        toast.error(t('validationError'), {
          description: t('fillRequiredFields')
        });
        return;
      }

      // Submit the data
      console.log('Submitting data:', dataEntries);
      await submitCategoryForApproval(categoryId || '', schoolId || '');

      toast.success(t('dataSubmitted'), {
        description: t('dataSubmittedDesc')
      });
      setUnsavedChanges(false);
      setCategoryStatus('pending');
    } catch (error) {
      console.error('Error submitting data:', error);
      toast.error(t('errorOccurred'), {
        description: t('couldNotSubmitData')
      });
    } finally {
      setSubmitting(false);
    }
  }, [
    t,
    dataEntries,
    columns,
    categoryId,
    schoolId,
    submitCategoryForApproval,
    setSubmitting,
    setUnsavedChanges,
    setCategoryStatus,
    setErrors
  ]);
  
  return {
    handleDataChange,
    handleSubmitForApproval,
    fetchDataEntriesForCategory,
    errors,
    setErrors
  };
};

export default useDataEntryActions;
