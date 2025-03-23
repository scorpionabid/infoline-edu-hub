
import { useState, useRef, useEffect } from 'react';
import { CategoryWithColumns } from '@/types/column';
import { mockCategories } from '@/data/mockCategories';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

export const useDataEntryState = (selectedCategoryId: string | null) => {
  const [categories, setCategories] = useState<CategoryWithColumns[]>(mockCategories);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dataChanged, setDataChanged] = useState<boolean>(false);
  const { t } = useLanguage();
  
  // URL-də dəyişiklik olduqda category-nin yenilənməsi üçün ref
  const lastCategoryIdRef = useRef<string | null>(selectedCategoryId);
  
  // Avtomatik saxlama üçün timer
  const autoSaveTimerRef = useRef<number | null>(null);
  
  // Dəyişikliklər varsa, avtomatik saxla
  useEffect(() => {
    if (dataChanged) {
      if (autoSaveTimerRef.current) {
        window.clearTimeout(autoSaveTimerRef.current);
      }
      
      autoSaveTimerRef.current = window.setTimeout(() => {
        console.log('Auto-saving data...');
        // Burada API saxlama sorğusu olacaq
        toast.success(t('autoSaveSuccess'), {
          description: t('autoSaveDescription'),
          duration: 2000
        });
        setDataChanged(false);
      }, 10000); // 10 saniyə gecikmə ilə avtosaxlama
    }
    
    return () => {
      if (autoSaveTimerRef.current) {
        window.clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [dataChanged, t]);
  
  // Veb səhifədən ayrılarkən xəbərdarlıq göstər
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dataChanged) {
        const message = t('unsavedChangesWarning');
        e.returnValue = message;
        return message;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [dataChanged, t]);

  return {
    categories,
    setCategories,
    currentCategoryIndex,
    setCurrentCategoryIndex,
    isLoading,
    setIsLoading,
    lastCategoryIdRef,
    dataChanged,
    setDataChanged
  };
};
