
import { useState, useCallback } from 'react';
import { DataEntry } from '@/types/dataEntry';

export interface UseBaseDataEntryOptions {
  categoryId: string;
  schoolId: string;
}

export interface UseBaseDataEntryResult {
  isLoading: boolean;
  isSaving: boolean;
  entries: DataEntry[];
  saveEntries: (data: Record<string, any>) => Promise<void>;
  loadEntries: () => Promise<void>;
}

export const useBaseDataEntry = ({ 
  categoryId, 
  schoolId 
}: UseBaseDataEntryOptions): UseBaseDataEntryResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [entries, setEntries] = useState<DataEntry[]>([]);

  const saveEntries = useCallback(async (data: Record<string, any>) => {
    setIsSaving(true);
    try {
      // Mock save implementation
      console.log('Saving entries:', { categoryId, schoolId, data });
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Save failed:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [categoryId, schoolId]);

  const loadEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      // Mock load implementation
      console.log('Loading entries:', { categoryId, schoolId });
      await new Promise(resolve => setTimeout(resolve, 500));
      setEntries([]);
    } catch (error) {
      console.error('Load failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, schoolId]);

  return {
    isLoading,
    isSaving,
    entries,
    saveEntries,
    loadEntries
  };
};

export default useBaseDataEntry;
