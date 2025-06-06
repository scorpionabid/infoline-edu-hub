
import { useEffect, useCallback, useState } from 'react';
import { useDebounce } from './useDebounce';

export interface UseAutoSaveOptions {
  categoryId: string;
  schoolId: string;
  formData: Record<string, any>;
  isDataModified: boolean;
  enabled?: boolean;
  delay?: number;
}

export interface UseAutoSaveResult {
  saveNow: () => Promise<void>;
  getLastSaveTime: () => Date | null;
  isSaving: boolean;
  autoSaveEnabled: boolean;
}

export const useAutoSave = ({
  categoryId,
  schoolId,
  formData,
  isDataModified,
  enabled = true,
  delay = 30000 // 30 seconds
}: UseAutoSaveOptions): UseAutoSaveResult => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  
  const debouncedFormData = useDebounce(formData, delay);
  
  const saveNow = useCallback(async () => {
    if (!enabled || !isDataModified || isSaving) return;
    
    try {
      setIsSaving(true);
      // Mock save implementation - replace with actual API call
      console.log('Auto-saving data:', { categoryId, schoolId, formData });
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastSaveTime(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [enabled, isDataModified, isSaving, categoryId, schoolId, formData]);
  
  // Auto-save when data changes
  useEffect(() => {
    if (enabled && isDataModified && !isSaving) {
      saveNow();
    }
  }, [debouncedFormData, enabled, isDataModified, isSaving, saveNow]);
  
  const getLastSaveTime = useCallback(() => lastSaveTime, [lastSaveTime]);
  
  return {
    saveNow,
    getLastSaveTime,
    isSaving,
    autoSaveEnabled: enabled
  };
};

export default useAutoSave;
