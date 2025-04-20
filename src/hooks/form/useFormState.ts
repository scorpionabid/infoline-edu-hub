
import { useState, useCallback } from 'react';
import { DataEntryForm } from '@/types/dataEntry';

export const useFormState = (initialState?: Partial<DataEntryForm>) => {
  const [formData, setFormData] = useState<DataEntryForm>({
    schoolId: initialState?.schoolId || '',
    categoryId: initialState?.categoryId || '',
    entries: initialState?.entries || [],
    status: initialState?.status || 'draft'
  });
  
  const updateFormData = useCallback((newData: Partial<DataEntryForm>) => {
    setFormData(prev => ({
      ...prev,
      ...newData
    }));
  }, []);
  
  const resetForm = useCallback(() => {
    setFormData({
      schoolId: initialState?.schoolId || '',
      categoryId: initialState?.categoryId || '',
      entries: [],
      status: 'draft'
    });
  }, [initialState]);
  
  return {
    formData,
    setFormData,
    updateFormData,
    resetForm
  };
};
