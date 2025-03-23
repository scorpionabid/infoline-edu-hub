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
  
  const lastCategoryIdRef = useRef<string | null>(selectedCategoryId);
  
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
  
  const performAutoSave = useEffect(() => {
    if (!dataChanged) return;
    
    if (autoSaveTimerRef.current) {
      window.clearTimeout(autoSaveTimerRef.current);
    }
    
    autoSaveTimerRef.current = window.setTimeout(() => {
      console.log('Auto-saving data...');
      setAutoSaveState(prevState => ({
        ...prevState, 
        inProgress: true,
        pendingChanges: true,
        saveMethod: 'auto'
      }));
      setIsSaving(true);
      saveAttemptTimestampRef.current = Date.now();
      
      const saveData = async () => {
        try {
          const networkSimulation = Math.random();
          if (networkSimulation < 0.1) {
            throw new Error("Network error when saving data");
          }
          
          const currentTime = new Date();
          setAutoSaveState(prevState => ({
            ...prevState, 
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
          
          if (prevState.saveMethod === 'manual') {
            toast.success(t('manualSaveSuccess'));
          } else {
            toast.success(t('autoSaveSuccess'));
          }
        } catch (error) {
          console.error('Data saxlanması zamanı xəta:', error);
          consecutiveErrorsRef.current += 1;
          
          setAutoSaveState(prevState => {
            const newRetryCount = prevState.retryCount + 1;
            const newErrors = [...prevState.errors, String(error)];
            const timeSinceAttempt = Date.now() - saveAttemptTimestampRef.current;
            
            if (timeSinceAttempt < 500) {
              toast.error(t('serverNotResponding'));
            } else if (consecutiveErrorsRef.current >= 3) {
              setNetworkError(true);
              toast.error(t('persistentSaveErrors'));
            } else {
              toast.error(t('autoSaveError'));
            }
            
            return {
              ...prevState,
              inProgress: false,
              errors: newErrors,
              retryCount: newRetryCount,
              saveMethod: null
            };
          });
          
          setIsSaving(false);
          
          if (consecutiveErrorsRef.current < 3) {
            const backoffTime = Math.min(3000 * Math.pow(1.5, consecutiveErrorsRef.current - 1), 15000);
            console.log(`Yenidən cəhd ediləcək: ${backoffTime}ms sonra`);
            autoSaveTimerRef.current = window.setTimeout(() => {
              setDataChanged(true);
            }, backoffTime);
          }
        }
      };
      
      saveData();
    }, 2000);
    
    return () => {
      if (autoSaveTimerRef.current) {
        window.clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [dataChanged, t, autoSaveState.retryCount]);
  
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (autoSaveState.inProgress || dataChanged || autoSaveState.pendingChanges) {
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
      setDataChanged(true);
      
      toast.info(t('retryingSave'), {
        description: t('retryingSaveDescription'),
      });
    } else {
      toast.info(t('noChangesToSave'), {
        description: t('allChangesSaved')
      });
    }
  };
  
  const pauseAndSave = () => {
    if (dataChanged || autoSaveState.pendingChanges) {
      setAutoSaveState(prev => ({
        ...prev,
        saveMethod: 'manual',
        inProgress: true
      }));
      setDataChanged(true);
      
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
