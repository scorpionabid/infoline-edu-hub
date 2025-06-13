
import { useState, useEffect, useCallback } from 'react';
import { DataEntryService } from '@/services/dataEntry';

interface UseAutoSaveOptions {
  categoryId: string;
  schoolId: string;
  formData: Record<string, any>;
  isDataModified: boolean;
  enabled?: boolean;
  intervalMs?: number;
  onSaveSuccess?: (savedAt: Date) => void;
  onSaveError?: (error: string) => void;
}

export const useAutoSave = ({
  categoryId,
  schoolId,
  formData,
  isDataModified,
  enabled = true,
  intervalMs = 30000, // 30 seconds
  onSaveSuccess,
  onSaveError
}: UseAutoSaveOptions) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveAttempts, setSaveAttempts] = useState(0);

  const saveNow = useCallback(async () => {
    if (!categoryId || !schoolId || !isDataModified || isSaving) {
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);
      setSaveAttempts(prev => prev + 1);

      const result = await DataEntryService.saveFormData(formData, {
        categoryId,
        schoolId,
        status: 'draft'
      });

      if (result.success) {
        const now = new Date();
        setLastSaveTime(now);
        setSaveAttempts(0);
        onSaveSuccess?.(now);
      } else {
        throw new Error(result.error || 'Save failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Auto-save failed';
      setSaveError(errorMessage);
      onSaveError?.(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [categoryId, schoolId, formData, isDataModified, isSaving, onSaveSuccess, onSaveError]);

  // Auto-save interval
  useEffect(() => {
    if (!enabled || !isDataModified) {
      return;
    }

    const interval = setInterval(() => {
      saveNow();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [enabled, isDataModified, saveNow, intervalMs]);

  const resetError = useCallback(() => {
    setSaveError(null);
    setSaveAttempts(0);
  }, []);

  return {
    isSaving,
    lastSaveTime,
    saveError,
    saveAttempts,
    autoSaveEnabled: enabled,
    hasUnsavedChanges: isDataModified,
    saveNow,
    resetError
  };
};
