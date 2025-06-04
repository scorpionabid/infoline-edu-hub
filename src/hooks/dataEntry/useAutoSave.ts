
import { useEffect, useRef, useCallback, useState } from 'react';
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

export interface UseAutoSaveResult {
  saveNow: () => Promise<void>;
  getLastSaveTime: () => number;
  isSaving: boolean;
  autoSaveEnabled: boolean;
  lastSaveTime: number;
}

/**
 * Auto-save hook for form data
 * Automatically saves form data at specified intervals
 */
export function useAutoSave({
  categoryId,
  schoolId,
  formData,
  isDataModified,
  autoSaveInterval = 30000, // 30 seconds
  enabled = true
}: UseAutoSaveProps): UseAutoSaveResult {
  const { t } = useLanguage();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTimeRef = useRef<number>(0);
  const [lastSaveTime, setLastSaveTime] = useState<number>(0);
  
  const { saveEntries, isSaving } = useDataEntryState({
    categoryId,
    schoolId,
    enabled: false // Only used for saving functionality
  });
  
  // Auto-save function
  const performAutoSave = useCallback(async () => {
    if (!enabled || !isDataModified || isSaving || !categoryId || !schoolId) {
      return;
    }
    
    try {
      // Convert form data to entries format
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
        const saveTime = Date.now();
        lastSaveTimeRef.current = saveTime;
        setLastSaveTime(saveTime);
        
        // Show subtle notification
        toast.success(t('autoSaveComplete') || 'Auto-saved', {
          duration: 2000,
          position: 'bottom-right'
        });
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
      toast.error(t('autoSaveFailed') || 'Auto-save failed', {
        duration: 3000,
        position: 'bottom-right'
      });
    }
  }, [enabled, isDataModified, isSaving, formData, categoryId, schoolId, saveEntries, t]);
  
  // Set up interval
  useEffect(() => {
    if (!enabled || !isDataModified) {
      return;
    }
    
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Set new interval
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
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  // Manual save function
  const saveNow = useCallback(async () => {
    await performAutoSave();
  }, [performAutoSave]);
  
  // Get last save time
  const getLastSaveTime = useCallback(() => {
    return lastSaveTimeRef.current;
  }, []);
  
  return {
    saveNow,
    getLastSaveTime,
    isSaving,
    autoSaveEnabled: enabled && isDataModified,
    lastSaveTime
  };
}

export default useAutoSave;
