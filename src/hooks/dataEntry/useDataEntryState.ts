
import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useCategoryData } from './useCategoryData';
import { CategoryWithColumns, EntryValue } from '@/types/dataEntry';

export const useDataEntryState = (schoolId?: string) => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [activeTabId, setActiveTabId] = useState<string | undefined>(categoryId);
  const [entries, setEntries] = useState<Record<string, EntryValue[]>>({});
  
  // useCategoryData'dan döndürülən dəyərləri al
  const { categories, loading, error, getCategoryById, refreshCategories } = useCategoryData({ 
    schoolId: schoolId || '' 
  });
  
  // Düzəliş: refreshCategories istifadə et
  const handleRefresh = useCallback(async () => {
    await refreshCategories(); 
  }, [refreshCategories]);
  
  return {
    categories,
    isLoading: loading,
    error,
    activeTabId,
    setActiveTabId,
    entries,
    setEntries,
    handleRefresh
  };
};
