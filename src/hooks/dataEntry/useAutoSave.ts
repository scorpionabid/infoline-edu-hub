
import { useEffect, useRef, useState } from 'react';

export interface UseAutoSaveOptions {
  categoryId: string;
  schoolId: string;
  formData: Record<string, any>;
  isDataModified: boolean;
  enabled?: boolean;
  interval?: number;
}

export function useAutoSave({
  categoryId,
  schoolId,
  formData,
  isDataModified,
  enabled = true,
  interval = 30000
}: UseAutoSaveOptions) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const saveNow = async () => {
    if (isSaving || !isDataModified) return;
    
    setIsSaving(true);
    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastSaveTime(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getLastSaveTime = () => lastSaveTime;

  useEffect(() => {
    if (!enabled || !isDataModified || isSaving) return;

    timeoutRef.current = setTimeout(() => {
      saveNow();
    }, interval);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, isDataModified, isSaving, interval]);

  return {
    saveNow,
    isSaving,
    autoSaveEnabled: enabled,
    getLastSaveTime
  };
}

export default useAutoSave;
