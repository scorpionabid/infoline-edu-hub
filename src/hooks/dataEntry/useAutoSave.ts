
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface UseAutoSaveOptions {
  data: Record<string, any>;
  saveFunction: () => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

export const useAutoSave = ({
  data,
  saveFunction,
  delay = 2000,
  enabled = true
}: UseAutoSaveOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedData = useRef<string>('');

  useEffect(() => {
    if (!enabled) return;

    const currentDataString = JSON.stringify(data);
    
    // If data hasn't changed, don't save
    if (currentDataString === lastSavedData.current) return;

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(async () => {
      try {
        await saveFunction();
        lastSavedData.current = currentDataString;
        toast.success('Məlumatlar avtomatik yadda saxlanıldı');
      } catch (error) {
        console.error('Auto-save error:', error);
        toast.error('Avtomatik saxlama xətası');
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, saveFunction, delay, enabled]);

  return {
    cancel: () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  };
};
