
import { useEffect, useRef, useCallback } from 'react';

export interface UseAutoSaveOptions {
  delay?: number;
  enabled?: boolean;
}

export interface UseAutoSaveResult {
  triggerAutoSave: () => void;
  cancelAutoSave: () => void;
}

export const useAutoSave = (
  saveFunction: () => Promise<void>,
  dependencies: any[],
  options: UseAutoSaveOptions = {}
): UseAutoSaveResult => {
  const { delay = 2000, enabled = true } = options;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cancelAutoSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const triggerAutoSave = useCallback(() => {
    if (!enabled) return;
    
    cancelAutoSave();
    timeoutRef.current = setTimeout(async () => {
      try {
        await saveFunction();
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, delay);
  }, [saveFunction, delay, enabled, cancelAutoSave]);

  useEffect(() => {
    if (enabled && dependencies.some(dep => dep !== undefined)) {
      triggerAutoSave();
    }
    return cancelAutoSave;
  }, [...dependencies, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return cancelAutoSave;
  }, [cancelAutoSave]);

  return {
    triggerAutoSave,
    cancelAutoSave
  };
};

export default useAutoSave;
