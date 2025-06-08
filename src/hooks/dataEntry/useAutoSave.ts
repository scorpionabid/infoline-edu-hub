
import { useEffect, useRef } from 'react';

export interface UseAutoSaveOptions {
  formData: Record<string, any>;
  isDataModified: boolean;
  enabled: boolean;
}

export function useAutoSave(options: UseAutoSaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!options.enabled || !options.isDataModified) {
      return;
    }

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(() => {
      console.log('Auto-save triggered for form data:', options.formData);
      // Auto-save logic can be implemented here
    }, 3000); // 3 seconds delay

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [options.formData, options.isDataModified, options.enabled]);

  return {
    cancel: () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  };
}

export default useAutoSave;
