
import { useState, useCallback } from 'react';
import { DataEntryForm, CategoryEntryData } from '@/types/dataEntry';

export interface UseFormStateProps {
  initialFormState?: DataEntryForm;
}

export const useFormState = ({ initialFormState }: UseFormStateProps = {}) => {
  const [formState, setFormState] = useState<DataEntryForm>(initialFormState || {
    status: 'draft',
    entries: [],
    lastSaved: new Date().toISOString(),
    overallProgress: 0
  });

  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form-un məlumatlarını yeniləmək üçün funksiya
  const updateFormEntries = useCallback((entries: CategoryEntryData[]) => {
    setFormState(prevState => ({
      ...prevState,
      entries,
      lastSaved: new Date().toISOString()
    }));
  }, []);

  return {
    formState,
    setFormState,
    isAutoSaving,
    setIsAutoSaving,
    isSubmitting, 
    setIsSubmitting,
    updateFormEntries
  };
};
