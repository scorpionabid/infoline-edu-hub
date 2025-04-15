
import { useState, useCallback } from 'react';
import { DataEntryForm } from '@/types/dataEntry';

/**
 * @description Form vəziyyətini idarə etmək üçün hook
 */
export const useFormState = () => {
  const emptyForm: DataEntryForm = {
    categories: [],
    overallCompletionPercentage: 0,
    entries: []
  };
  
  const [formData, setFormData] = useState<DataEntryForm>(emptyForm);
  
  // Form məlumatlarının qismən yenilənməsi üçün funksiya
  const updateFormData = useCallback((newData: Partial<DataEntryForm>) => {
    setFormData(prevData => ({
      ...prevData,
      ...newData
    }));
  }, []);
  
  return {
    formData,
    setFormData,
    updateFormData
  };
};
