
import { useState } from 'react';

export function useDataEntryForm(schoolId?: string, categoryId?: string) {
  const [formData, setFormData] = useState<any>({
    schoolId: schoolId || '',
    categoryId: categoryId || '',
    entries: [],
  });

  const updateFormData = (newData: any) => {
    setFormData(prev => ({
      ...prev,
      ...newData
    }));
  };

  return {
    formData,
    setFormData,
    updateFormData,
  };
}
