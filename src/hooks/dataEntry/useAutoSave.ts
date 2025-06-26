
import { useEffect, useRef } from 'react';
import { saveDataEntry } from '@/services/dataEntry';
import { DataEntryFormData } from '@/types/dataEntry';

interface UseAutoSaveProps {
  data: DataEntryFormData;
  schoolId: string;
  categoryId: string;
  interval?: number;
  enabled?: boolean;
}

export const useAutoSave = ({
  data,
  schoolId,
  categoryId,
  interval = 30000,
  enabled = true
}: UseAutoSaveProps) => {
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!enabled || !data || Object.keys(data).length === 0) {
      return;
    }

    const autoSave = async () => {
      try {
        await saveDataEntry({
          schoolId,
          categoryId,
          // data
        });
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    };

    intervalRef.current = setInterval(autoSave, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [data, schoolId, categoryId, interval, enabled]);

  const saveNow = async () => {
    try {
      await saveDataEntry({
        schoolId,
        categoryId,
        // data
      });
      return true;
    } catch (error) {
      console.error('Manual save failed:', error);
      return false;
    }
  };

  return { saveNow };
};
