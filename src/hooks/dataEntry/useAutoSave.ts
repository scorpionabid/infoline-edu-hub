
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface UseAutoSaveProps {
  categoryId: string;
  schoolId: string;
  formData: Record<string, any>;
  isDataModified: boolean;
  enabled?: boolean;
}

export const useAutoSave = ({
  categoryId,
  schoolId,
  formData,
  isDataModified,
  enabled = true
}: UseAutoSaveProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [autoSaveEnabled] = useState(enabled);

  const saveNow = useCallback(async () => {
    if (!enabled || !isDataModified || isSaving) return;
    
    setIsSaving(true);
    try {
      // Auto-save logic here
      console.log('Auto-saving data...', { categoryId, schoolId, formData });
      setLastSaveTime(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
      toast.error('Auto-save failed');
    } finally {
      setIsSaving(false);
    }
  }, [categoryId, schoolId, formData, isDataModified, enabled, isSaving]);

  const getLastSaveTime = useCallback(() => lastSaveTime, [lastSaveTime]);

  useEffect(() => {
    if (!autoSaveEnabled || !isDataModified) return;

    const autoSaveTimer = setTimeout(() => {
      saveNow();
    }, 30000); // Auto-save after 30 seconds

    return () => clearTimeout(autoSaveTimer);
  }, [isDataModified, autoSaveEnabled, saveNow]);

  return {
    saveNow,
    isSaving,
    autoSaveEnabled,
    getLastSaveTime
  };
};
