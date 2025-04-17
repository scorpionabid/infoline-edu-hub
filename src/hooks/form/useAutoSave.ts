
import { useCallback, useEffect } from 'react';
import { DataEntryForm } from '@/types/dataEntry';
import { toast } from '@/components/ui/use-toast';
import { useLanguage } from '@/context/LanguageContext';

interface UseAutoSaveProps {
  formData: DataEntryForm;
  isAutoSaving: boolean;
  setIsAutoSaving: React.Dispatch<React.SetStateAction<boolean>>;
  lastOperationTimeRef: React.RefObject<number>;
}

/**
 * Avtomatik saxlama funksionallığını idarə edən hook
 */
export const useAutoSave = ({
  formData,
  isAutoSaving,
  setIsAutoSaving,
  lastOperationTimeRef
}: UseAutoSaveProps) => {
  const { t } = useLanguage();
  
  // Auto saxlama simulyasiyası
  const setupAutoSave = useCallback((validateFn: () => boolean) => {
    if (isAutoSaving) {
      // Yalnız son əməliyyatdan 1.5 saniyə keçibsə avtomatik saxlayaq
      const timer = setTimeout(() => {
        const currentTime = Date.now();
        const timeSinceLastOperation = currentTime - lastOperationTimeRef.current;
        
        // Əgər istifadəçi son 1.5 saniyədə yeni dəyişiklik etməyibsə
        if (timeSinceLastOperation >= 1500) {
          // Burada real API çağırışı olmalıdır
          console.log("Məlumatlar avtomatik saxlanıldı:", formData);
          
          // LocalStorage-də saxlayaq
          localStorage.setItem('infolineFormData', JSON.stringify(formData));
          
          setIsAutoSaving(false);
          
          toast({
            title: t('changesAutoSaved'),
            variant: "default",
          });
          
          // Məlumatları saxladıqdan sonra validasiya etmək
          validateFn();
        }
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [formData, isAutoSaving, t, setIsAutoSaving, lastOperationTimeRef]);
  
  return {
    setupAutoSave
  };
};
