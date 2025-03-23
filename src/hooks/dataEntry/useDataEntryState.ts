
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
  pendingChanges: boolean;
  saveMethod: 'auto' | 'manual' | null;
}

export const useDataEntryState = (selectedCategoryId: string | null) => {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<CategoryWithColumns[]>(mockCategories);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dataChanged, setDataChanged] = useState<boolean>(false);
  const [networkError, setNetworkError] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // URL-də dəyişiklik olduqda category-nin yenilənməsi üçün ref
  const lastCategoryIdRef = useRef<string | null>(selectedCategoryId);
  
  // Avtomatik saxlama üçün timer və vəziyyət
  const autoSaveTimerRef = useRef<number | null>(null);
  const consecutiveErrorsRef = useRef<number>(0);
  const saveAttemptTimestampRef = useRef<number>(Date.now());
  
  const [autoSaveState, setAutoSaveState] = useState<AutoSaveState>({
    inProgress: false,
    lastSaved: null,
    errors: [],
    retryCount: 0,
    pendingChanges: false,
    saveMethod: null
  });
  
  // Avtomatik saxlama funksiyası - genişləndirilmiş 
  const performAutoSave = useEffect(() => {
    if (!dataChanged) return;
    
    // Əvvəlki timer varsa, təmizləyək
    if (autoSaveTimerRef.current) {
      window.clearTimeout(autoSaveTimerRef.current);
    }
    
    // Yeni timer yaradaq
    autoSaveTimerRef.current = window.setTimeout(() => {
      console.log('Auto-saving data...');
      setAutoSaveState(prev => ({
        ...prev, 
        inProgress: true,
        pendingChanges: true,
        saveMethod: 'auto'
      }));
      setIsSaving(true);
      saveAttemptTimestampRef.current = Date.now();
      
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
          
          const currentTime = new Date();
          // Saxlama uğurlu oldu
          setAutoSaveState(prev => ({
            ...prev, 
            inProgress: false,
            lastSaved: currentTime,
            errors: [],
            retryCount: 0,
            pendingChanges: false,
            saveMethod: null
          }));
          
          setNetworkError(false);
          setDataChanged(false);
          setIsSaving(false);
          consecutiveErrorsRef.current = 0;
          
          // Saxlamanın uğurlu olduğunu bildirişi (əl ilə saxlama üçün bildiriş daha qabarıq)
          if (prev.saveMethod === 'manual') {
            toast.success(t('manualSaveSuccess'), {
              description: t('changesSavedAt', { time: currentTime.toLocaleTimeString() }),
              duration: 3000
            });
          } else {
            toast.success(t('autoSaveSuccess'), {
              description: t('autoSaveDescription'),
              duration: 2000
            });
          }
          
        } catch (error) {
          console.error('Data saxlanması zamanı xəta:', error);
          consecutiveErrorsRef.current += 1;
          
          // Xəta vəziyyətini yeniləyək
          setAutoSaveState(prev => {
            const newRetryCount = prev.retryCount + 1;
            const newErrors = [...prev.errors, String(error)];
            const timeSinceAttempt = Date.now() - saveAttemptTimestampRef.current;
            
            // İstifadəçiyə müxtəlif xəta bildirişləri göstərək
            if (timeSinceAttempt < 500) {
              // Sürətli xəta - server cavab vermir
              toast.error(t('serverNotResponding'), {
                description: t('tryAgainLater'),
                duration: 4000
              });
            } else if (consecutiveErrorsRef.current >= 3) {
              // Bir-birinin ardınca çoxlu xətalar
              setNetworkError(true);
              toast.error(t('persistentSaveErrors'), {
                description: t('checkNetworkConnection'),
                duration: 5000
              });
            } else {
              // Standart xəta
              toast.error(t('autoSaveError'), {
                description: t('autoSaveErrorRetry'),
                duration: 4000
              });
            }
            
            return {
              ...prev,
              inProgress: false,
              errors: newErrors,
              retryCount: newRetryCount,
              saveMethod: null
            };
          });
          
          setIsSaving(false);
          
          // Tez bir zamanda yenidən cəhd et (artıq çox sayda cəhd edilməmişsə)
          if (consecutiveErrorsRef.current < 3) {
            const backoffTime = Math.min(3000 * Math.pow(1.5, consecutiveErrorsRef.current - 1), 15000);
            console.log(`Yenidən cəhd ediləcək: ${backoffTime}ms sonra`);
            autoSaveTimerRef.current = window.setTimeout(() => {
              // Yeni cəhd üçün dataChanged-i true edirik
              setDataChanged(true);
            }, backoffTime);
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
  
  // Veb səhifədən ayrılarkən xəbərdarlıq göstər - genişləndirilmiş
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Əgər avtomatik saxlama prosesindədirsə və ya saxlanmamış dəyişikliklər varsa
      if (autoSaveState.inProgress || dataChanged || autoSaveState.pendingChanges) {
        // Kontekstə uyğun mesaj göstərmək
        let message = '';
        
        if (autoSaveState.inProgress) {
          message = t('savingInProgressWarning');
        } else if (networkError) {
          message = t('unsavedChangesNetworkError');
        } else if (dataChanged || autoSaveState.pendingChanges) {
          message = t('unsavedChangesWarning');
        }
        
        e.returnValue = message;
        return message;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [dataChanged, autoSaveState.inProgress, autoSaveState.pendingChanges, networkError, t]);
  
  // Manual olaraq təkrar saxlama funksiyası - genişləndirilmiş
  const manualRetry = () => {
    if (networkError || dataChanged || autoSaveState.pendingChanges) {
      setNetworkError(false);
      setAutoSaveState(prev => ({
        ...prev, 
        retryCount: 0, 
        errors: [],
        saveMethod: 'manual',
        inProgress: true
      }));
      setDataChanged(true); // Avtomatik saxlama prosesini yenidən başladır
      
      toast.info(t('retryingSave'), {
        description: t('retryingSaveDescription'),
      });
    } else {
      // Əgər saxlanılacaq dəyişiklik yoxdursa, bunu bildirək
      toast.info(t('noChangesToSave'), {
        description: t('allChangesSaved')
      });
    }
  };
  
  // Əlavə funksiya: İnfoLine formasına xarakterik "məzuniyyət" funksiyası
  // İşiniz yarıda kəsildikdə formanı müvəqqəti olaraq saxlayıb sonra işə qayıda bilərsiniz
  const pauseAndSave = () => {
    if (dataChanged || autoSaveState.pendingChanges) {
      setAutoSaveState(prev => ({
        ...prev,
        saveMethod: 'manual',
        inProgress: true
      }));
      setDataChanged(true);
      
      // Pause bildirişini göstəririk
      toast.success(t('workPaused'), {
        description: t('workPausedDescription'),
        duration: 4000
      });
    } else {
      toast.info(t('workPaused'), {
        description: t('noChangesPaused'),
        duration: 3000
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
    manualRetry,
    pauseAndSave,
    isSaving
  };
};
