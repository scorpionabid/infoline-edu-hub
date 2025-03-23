
import { useCallback } from 'react';
import { CategoryEntryData, DataEntryForm } from '@/types/dataEntry';

interface UseFormInitializationProps {
  setFormData: React.Dispatch<React.SetStateAction<DataEntryForm>>;
}

/**
 * Formanın ilkin məlumatlarını yükləyən hook
 */
export const useFormInitialization = ({ setFormData }: UseFormInitializationProps) => {
  // Formanı ilkin məlumatlarla doldurmaq
  const initializeForm = useCallback((initialEntries: CategoryEntryData[], formStatus: 'draft' | 'submitted' | 'approved' | 'rejected' = 'draft') => {
    // Daha öncə saxlanılmış məlumatlar varsa onları localStorage-dən yükləyək
    const savedFormData = localStorage.getItem('infolineFormData');
    
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        if (parsedData.entries && parsedData.entries.length > 0) {
          // LocalStorage-də olan məlumatlarla serverdən gələn məlumatları birləşdirmək
          const mergedEntries = initialEntries.map(initialEntry => {
            const savedEntry = parsedData.entries.find((e: CategoryEntryData) => e.categoryId === initialEntry.categoryId);
            if (savedEntry) {
              // Savedentry-də olan dəyərləri initialEntry-yə köçürək
              initialEntry.values = savedEntry.values;
              initialEntry.completionPercentage = savedEntry.completionPercentage;
              initialEntry.isCompleted = savedEntry.isCompleted;
            }
            return initialEntry;
          });
          
          setFormData({
            ...parsedData,
            entries: mergedEntries,
            status: formStatus,
            lastSaved: new Date().toISOString()
          });
          return;
        }
      } catch (error) {
        console.error('LocalStorage-dən məlumatların yüklənməsi zamanı xəta:', error);
      }
    }
    
    // Əgər localStorage-də məlumat yoxdursa, ilkin məlumatları istifadə et
    setFormData(prev => ({
      ...prev,
      entries: initialEntries,
      lastSaved: new Date().toISOString(),
      status: formStatus
    }));
  }, [setFormData]);
  
  return {
    initializeForm
  };
};
