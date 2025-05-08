
import { useState, useCallback } from 'react';

export const useFormState = () => {
  const [formData, setFormData] = useState({
    schoolId: '',
    categoryId: '',
    entries: []
  });

  const updateFormData = useCallback((data: any) => {
    setFormData(prev => ({
      ...prev,
      ...data
    }));
  }, []);

  return {
    formData,
    setFormData,
    updateFormData
  };
};
