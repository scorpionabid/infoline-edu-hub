
import { useMemo } from 'react';
import { useDataEntriesQuery } from '@/hooks/api/dataEntry/useDataEntriesQuery';
import { useIndexedData } from '@/hooks/core/useIndexedData';
import { DataEntry, DataEntryStatus } from '@/types/dataEntry';

/**
 * Məlumat daxil etmə vəziyyətini idarə etmək üçün hook parametrləri
 */
export interface UseDataEntryStateProps {
  categoryId: string;
  schoolId: string;
  enabled?: boolean;
  user?: any;
  isSectorAdmin?: boolean;
  categoryIdFromUrl?: string;
  schoolIdFromUrl?: string;
}

/**
 * Məlumat daxil etmə vəziyyətini idarə etmək üçün yüksək səviyyəli hook
 */
export function useDataEntryState({
  categoryId,
  schoolId,
  enabled = true
}: UseDataEntryStateProps) {
  // Data entries sorğusu
  const {
    entries = [],
    isLoading,
    isError,
    error,
    saveEntries,
    updateStatus,
    isSaving,
    isUpdatingStatus,
    refetch
  } = useDataEntriesQuery({ 
    categoryId, 
    schoolId,
    enabled
  });
  
  // UUID ilə indekslənmiş entries map
  const { 
    map: entriesMap, 
    getItem: getEntryByColumnId,
    hasItem: hasEntryForColumn
  } = useIndexedData(entries, 'column_id');
  
  // Mövcud entries-ləri kopyalayıb yeniləyən funksiya
  const updateEntryValue = (columnId: string, value: any) => {
    const existingEntry = getEntryByColumnId(columnId);
    
    // Mövcud və ya yeni entry hazırlayırıq
    const updatedEntry = existingEntry 
      ? { ...existingEntry, value, updated_at: new Date().toISOString() }
      : {
          column_id: columnId,
          category_id: categoryId,
          school_id: schoolId,
          value,
          status: DataEntryStatus.DRAFT,
          updated_at: new Date().toISOString()
        };
    
    // Yalnız bir entry yeniləyirik
    saveEntries([updatedEntry]);
  };
  
  // Bütün entries-ləri birdən yeniləyən funksiya
  const updateAllEntries = (updatedEntries: Partial<DataEntry>[]) => {
    saveEntries(updatedEntries);
  };
  
  // Hook nəticələrini qaytarırıq
  return {
    // Data və status
    entries,
    entriesMap,
    getEntryByColumnId,
    hasEntryForColumn,
    isLoading,
    isError,
    error,
    isSaving,
    isUpdatingStatus,
    
    // Funksiyalar
    updateEntryValue,
    updateAllEntries,
    updateStatus,
    refetch,
    
    // Xam sorğu funksiyaları
    saveEntries
  };
}

export default useDataEntryState;
