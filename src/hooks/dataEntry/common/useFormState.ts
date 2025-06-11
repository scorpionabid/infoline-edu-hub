
import { useState, useCallback } from 'react';

export const useFormState = (initialState: Record<string, any> = {}) => {
  const [formData, setFormData] = useState(initialState);
  const [isDirty, setIsDirty] = useState(false);

  const updateField = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialState);
    setIsDirty(false);
  }, [initialState]);

  return {
    formData,
    isDirty,
    updateField,
    resetForm,
    setFormData
  };
};
