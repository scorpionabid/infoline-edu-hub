
import { useState, useCallback } from 'react';

export interface UseFormStateResult {
  formData: Record<string, any>;
  isDirty: boolean;
  updateField: (fieldId: string, value: any) => void;
  updateFormData: (data: Record<string, any>) => void;
  resetForm: (initialData?: Record<string, any>) => void;
  markClean: () => void;
}

export const useFormState = (initialData: Record<string, any> = {}): UseFormStateResult => {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [isDirty, setIsDirty] = useState(false);

  const updateField = useCallback((fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    setIsDirty(true);
  }, []);

  const updateFormData = useCallback((data: Record<string, any>) => {
    setFormData(data);
    setIsDirty(true);
  }, []);

  const resetForm = useCallback((newInitialData?: Record<string, any>) => {
    const dataToUse = newInitialData || initialData;
    setFormData(dataToUse);
    setIsDirty(false);
  }, [initialData]);

  const markClean = useCallback(() => {
    setIsDirty(false);
  }, []);

  return {
    formData,
    isDirty,
    updateField,
    updateFormData,
    resetForm,
    markClean
  };
};

export default useFormState;
