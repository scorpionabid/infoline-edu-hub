
import { useState, useRef, useEffect } from 'react';
import { CategoryWithColumns } from '@/types/column';
import { mockCategories } from '@/data/mockCategories';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

interface AutoSaveState {
  inProgress: boolean;
  lastSaved: Date | null;
  errors: string[];
  retryCount: number;
}

export const useDataEntryState = (selectedCategoryId: string | null) => {
  const [categories, setCategories] = useState<CategoryWithColumns[]>(mockCategories);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dataChanged, setDataChanged] = useState<boolean>(false);
  const [networkError, setNetworkError] = useState<boolean>(false);
  const { t } = useLanguage();
  
  // URL-də dəyişiklik olduqda category-nin yenilənməsi üçün ref
  const lastCategoryIdRef = useRef<string | null>(selectedCategoryId);
  
  // Avtomatik saxlama üçün timer və vəziyyət
  const autoSaveTimerRef = useRef<number | null>(null);
  const [autoSaveState, setAutoSaveState] = useState<AutoSaveState>({
    inProgress: false,
    lastSaved: null,
    errors: [],
    retryCount: 0
  });
  
  // Avtomatik saxlama funksiyası - daha səmərəli hala gətirildi
  const performAutoSave = useEffect(() => {
    if (!dataChanged) return;
    
    // Əvvəlki timer varsa, təmizləyək
    if (autoSaveTimerRef.current) {
      window.clearTimeout(autoSaveTimerRef.current);
    }
    
    // Yeni timer yaradaq
    autoSaveTimerRef.current = window.setTimeout(() => {
      console.log('Auto-saving data...');
      setAutoSaveState(prev => ({...prev, inProgress: true}));
      
      // API sorğusu simulyasiyası - sonradan real API ilə əvəz edilə bilər
      const saveData = async () => {
        try {
          // Şəbəkə xətası simulyasiyası - təsadüfi olaraq 10% hallarda xəta baş verir
          const networkSimulation = Math.random();
          if (networkSimulation < 0.1) {
            throw new Error("Network error when saving data");
          }
          
          // Müvəffəqiyyətli saxlama
          await new Promise(resolve => setTimeout(resolve, 700)); // Saxlama latency simulyasiyası
          
          // Saxlama uğurlu oldu
          setAutoSaveState(prev => ({
            ...prev, 
            inProgress: false,
            lastSaved: new Date(),
            errors: [],
            retryCount: 0
          }));
          
          setNetworkError(false);
          setDataChanged(false);
          
          toast.success(t('autoSaveSuccess'), {
            description: t('autoSaveDescription'),
            duration: 2000
          });
          
        } catch (error) {
          console.error('Data saxlanması zamanı xəta:', error);
          
          // Xəta vəziyyətini yeniləyək
          setAutoSaveState(prev => {
            const newRetryCount = prev.retryCount + 1;
            const newErrors = [...prev.errors, String(error)];
            
            // Əgər çox sayda cəhd edilmişsə, istifadəçiyə bildiriş göstərək
            if (newRetryCount >= 3) {
              setNetworkError(true);
              toast.error(t('autoSaveError'), {
                description: t('autoSaveErrorRetry'),
                duration: 4000
              });
            }
            
            return {
              ...prev,
              inProgress: false,
              errors: newErrors,
              retryCount: newRetryCount
            };
          });
          
          // Tez bir zamanda yenidən cəhd et (artıq 3-dən çox cəhd edilməmişsə)
          if (autoSaveState.retryCount < 3) {
            autoSaveTimerRef.current = window.setTimeout(() => {
              // Yeni cəhd üçün dataChanged-i true edirik
              setDataChanged(true);
            }, 3000); // 3 saniyə sonra yenidən cəhd et
          }
        }
      };
      
      saveData();
    }, 2000); // 2 saniyə gecikmə ilə avtosaxlama - daha reaktiv təcrübə üçün
    
    return () => {
      if (autoSaveTimerRef.current) {
        window.clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [dataChanged, t, autoSaveState.retryCount]);
  
  // Veb səhifədən ayrılarkən xəbərdarlıq göstər
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Əgər avtomatik saxlama prosesindədirsə və ya saxlanmamış dəyişikliklər varsa
      if (autoSaveState.inProgress || dataChanged) {
        const message = t('unsavedChangesWarning');
        e.returnValue = message;
        return message;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [dataChanged, autoSaveState.inProgress, t]);
  
  // Manual olaraq təkrar saxlama funksiyası - şəbəkə xətası baş verdikdə istifadə olunur
  const manualRetry = () => {
    if (networkError) {
      setNetworkError(false);
      setAutoSaveState(prev => ({...prev, retryCount: 0, errors: []}));
      setDataChanged(true); // Avtomatik saxlama prosesini yenidən başladır
      
      toast.info(t('retryingSave'), {
        description: t('retryingSaveDescription'),
      });
    }
  };

  return {
    categories,
    setCategories,
    currentCategoryIndex,
    setCurrentCategoryIndex,
    isLoading,
    setIsLoading,
    lastCategoryIdRef,
    dataChanged,
    setDataChanged,
    autoSaveState,
    networkError,
    manualRetry
  };
};
