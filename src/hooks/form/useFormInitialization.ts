import { useCallback } from 'react';
import { EntryValue } from '@/types/dataEntry';

// Xətani düzəldək: `categoryId` əvəzinə `category_id`, `columnId` əvəzinə `column_id` istifadə edək

export const useFormInitialization = (initialData?: any) => {
  // İlkin məlumatlar varsa, onları hazırlayırıq
  const prepareInitialValues = useCallback((data: any) => {
    if (!data || !data.entries) return {};

    const initialValues: Record<string, any> = {};

    data.entries.forEach((entry: any) => {
      entry.values?.forEach((value: EntryValue) => {
        initialValues[`${value.category_id}_${value.column_id}`] = value.value;
      });
    });

    return initialValues;
  }, []);

  return {
    prepareInitialValues
  };
};
