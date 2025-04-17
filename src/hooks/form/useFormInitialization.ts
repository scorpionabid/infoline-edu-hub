
import { useCallback } from 'react';
import { EntryValue, DataEntryForm } from '@/types/dataEntry';

interface UseFormInitializationProps {
  setFormData: React.Dispatch<React.SetStateAction<DataEntryForm>>;
}

/**
 * Formanın ilkin məlumatlarını yükləyən hook
 */
export const useFormInitialization = ({ setFormData }: UseFormInitializationProps) => {
  // Formanı ilkin məlumatlarla doldurmaq
  const initializeForm = useCallback((initialEntries: EntryValue[], formStatus: 'draft' | 'pending' | 'approved' | 'rejected' | 'submitted' = 'draft') => {
    // Daha öncə saxlanılmış məlumatlar varsa onları localStorage-dən yükləyək
    const savedFormData = localStorage.getItem('infolineFormData');
    
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        if (parsedData.entries && parsedData.entries.length > 0) {
          // LocalStorage-də olan məlumatlarla serverdən gələn məlumatları birləşdirmək
          const mergedEntries = initialEntries.map(initialEntry => {
            const savedEntry = parsedData.entries.find((e: EntryValue) => 
              e.categoryId === initialEntry.categoryId && e.columnId === initialEntry.columnId
            );
            
            if (savedEntry) {
              return {
                ...initialEntry,
                value: savedEntry.value
              };
            }
            return initialEntry;
          });
          
          setFormData(prev => ({
            ...prev,
            entries: mergedEntries,
            status: formStatus === 'submitted' ? 'pending' : formStatus,
            submittedAt: new Date().toISOString()
          }));
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
      submittedAt: new Date().toISOString(),
      status: formStatus === 'submitted' ? 'pending' : formStatus
    }));
  }, [setFormData]);
  
  return {
    initializeForm
  };
};
