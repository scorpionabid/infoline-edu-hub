
import { useState, useCallback } from 'react';
import { CategoryEntryData, DataEntryForm } from '@/types/dataEntry';

export const useFormState = (initialCategories: any[] = []) => {
  const [formData, setFormData] = useState<DataEntryForm>({
    categories: [],
    overallCompletionPercentage: 0,
    formId: crypto.randomUUID(),
    schoolId: undefined,
    entries: [],
    status: 'draft'
  });
  
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Form değerlerini güncelleme
  const updateFormData = useCallback((newData: Partial<DataEntryForm>) => {
    setFormData(prev => ({
      ...prev,
      ...newData
    }));
  }, []);

  // Değer güncelleme
  const updateValue = useCallback((categoryId: string, columnId: string, value: any) => {
    setFormData(prev => {
      // Kategoriya ağacını dərin bir şəkildə clone edək
      const newData = { ...prev };
      
      // entries içində məlumatları yeniləyək (CategoryEntryData tipində)
      let updatedEntries = Array.isArray(newData.entries) ? [...newData.entries] : [];
      
      // Əgər uyğun kategoriya tapılmırsa
      let categoryEntry = updatedEntries.find(entry => entry.categoryId === categoryId);
      
      if (!categoryEntry) {
        // Yeni kategoriya əlavə edək
        categoryEntry = {
          categoryId,
          values: [],
          completionPercentage: 0
        };
        updatedEntries.push(categoryEntry);
      } else {
        // Mövcud kategoriyanı klonlayaq
        const categoryEntryIndex = updatedEntries.findIndex(entry => entry.categoryId === categoryId);
        updatedEntries[categoryEntryIndex] = { ...categoryEntry };
        categoryEntry = updatedEntries[categoryEntryIndex];
      }
      
      // Kategoriyanın values array'ini klonlayaq
      categoryEntry.values = [...categoryEntry.values];
      
      // Uyğun sütunu tapaq
      const valueIndex = categoryEntry.values.findIndex(val => val.columnId === columnId);
      
      if (valueIndex === -1) {
        // Əgər mövcud deyilsə əlavə edək
        categoryEntry.values.push({
          columnId,
          value
        });
      } else {
        // Mövcuddursa yeniləyək
        categoryEntry.values[valueIndex] = {
          ...categoryEntry.values[valueIndex],
          value
        };
      }
      
      // Yeni entries array'ini təyin edək
      newData.entries = updatedEntries;
      
      return newData;
    });
  }, []);

  return {
    formData,
    updateFormData,
    isAutoSaving,
    setIsAutoSaving,
    isSubmitting,
    setIsSubmitting,
    lastSaved,
    setLastSaved,
    updateValue
  };
};
