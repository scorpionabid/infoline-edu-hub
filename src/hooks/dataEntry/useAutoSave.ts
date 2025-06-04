
import { useEffect, useRef, useCallback } from 'react';
import { useDataEntryState } from '@/hooks/business/dataEntry/useDataEntryState';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';

export interface UseAutoSaveProps {
  categoryId: string;
  schoolId: string;
  formData: Record<string, any>;
  isDataModified: boolean;
  autoSaveInterval?: number; // milliseconds
  enabled?: boolean;
}

/**
 * Avtomatik saxlama hook-u
 * Forma məlumatlarını müəyyən intervallarla avtomatik olaraq yadda saxlayır
 */
export function useAutoSave({
  categoryId,
  schoolId,
  formData,
  isDataModified,
  autoSaveInterval = 30000, // 30 saniyə
  enabled = true
}: UseAutoSaveProps) {
  const { t } = useLanguage();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTimeRef = useRef<number>(0);
  
  const { saveEntries, isSaving } = useDataEntryState({
    categoryId,
    schoolId,
    enabled: false // Yalnız saxlama üçün istifadə edirik
  });
  
  // Avtomatik saxlama funksiyası
  const performAutoSave = useCallback(async () => {
    if (!enabled || !isDataModified || isSaving) {
      return;
    }
    
    try {
      // Form məlumatlarını entries formatına çeviririk
      const entriesToSave = Object.entries(formData)
        .filter(([columnId, value]) => columnId && columnId.trim() !== '')
        .map(([columnId, value]) => ({
          column_id: columnId,
          category_id: categoryId,
          school_id: schoolId,
          value: String(value || ''),
          status: 'draft' as const,
          updated_at: new Date().toISOString()
        }));
      
      if (entriesToSave.length > 0) {
        await saveEntries(entriesToSave);
        lastSaveTimeRef.current = Date.now();
        
        // Kiçik bildiriş göstəririk
        toast.success(t('autoSaveComplete'), {
          duration: 2000,
          position: 'bottom-right'
        });
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
      toast.error(t('autoSaveFailed'), {
        duration: 3000,
        position: 'bottom-right'
      });
    }
  }, [enabled, isDataModified, isSaving, formData, categoryId, schoolId, saveEntries, t]);
  
  // Interval təyin etmək
  useEffect(() => {
    if (!enabled || !isDataModified) {
      return;
    }
    
    // Mövcud interval-ı təmizlə
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Yeni interval təyin et
    intervalRef.current = setInterval(() => {
      performAutoSave();
    }, autoSaveInterval);
    
    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, isDataModified, autoSaveInterval, performAutoSave]);
  
  // Komponent unmount olduqda interval-ı təmizlə
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  // Manual saxlama funksiyası
  const saveNow = useCallback(async () => {
    await performAutoSave();
  }, [performAutoSave]);
  
  // Son saxlama vaxtını qaytarırıq
  const getLastSaveTime = useCallback(() => {
    return lastSaveTimeRef.current;
  }, []);
  
  return {
    saveNow,
    getLastSaveTime,
    isSaving,
    autoSaveEnabled: enabled && isDataModified
  };
}

export default useAutoSave;
