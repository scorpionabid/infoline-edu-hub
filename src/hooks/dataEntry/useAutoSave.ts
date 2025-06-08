
import { useEffect, useRef, useState } from 'react';

export interface UseAutoSaveOptions {
  formData: Record<string, any>;
  isDataModified: boolean;
  enabled: boolean;
}

export interface UseAutoSaveResult {
  cancel: () => void;
  saveNow: () => void;
  isSaving: boolean;
  autoSaveEnabled: boolean;
}

export function useAutoSave(options: UseAutoSaveOptions): UseAutoSaveResult {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const [isSaving, setIsSaving] = useState(false);

  const saveNow = () => {
    setIsSaving(true);
    console.log('Manual save triggered');
    // Simulate save operation
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  const cancel = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    if (!options.enabled || !options.isDataModified) {
      return;
    }

    // Clear previous timeout
    cancel();

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(() => {
      console.log('Auto-save triggered for form data:', options.formData);
      saveNow();
    }, 3000); // 3 seconds delay

    return cancel;
  }, [options.formData, options.isDataModified, options.enabled]);

  return {
    cancel,
    saveNow,
    isSaving,
    autoSaveEnabled: options.enabled
  };
}

export default useAutoSave;
