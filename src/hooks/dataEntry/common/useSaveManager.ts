
import { useState, useCallback } from 'react';

export const useSaveManager = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const saveData = useCallback(async (data: any, saveFunction: (data: any) => Promise<any>) => {
    setIsSaving(true);
    try {
      await saveFunction(data);
      setLastSaved(new Date().toISOString());
      return true;
    } catch (error) {
      console.error('Save error:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    isSaving,
    lastSaved,
    saveData
  };
};
