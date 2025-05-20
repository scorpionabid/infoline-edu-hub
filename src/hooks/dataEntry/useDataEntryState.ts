
import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useCategoryData } from './useCategoryData';
import { EntryValue } from '@/types/dataEntry';

export const useDataEntryState = (schoolId?: string) => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [activeTabId, setActiveTabId] = useState<string | undefined>(categoryId);
  const [entries, setEntries] = useState<Record<string, EntryValue[]>>({});
  
  // Pass categoryId directly to useCategoryData
  const categoryDataResult = useCategoryData(schoolId);
  const { categories, loading, error, refetch } = categoryDataResult;
  
  // Manual refresh function
  const handleRefresh = useCallback(async () => {
    console.log('Data entry state refreshing...');
    await refetch(); 
  }, [refetch]);
  
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
