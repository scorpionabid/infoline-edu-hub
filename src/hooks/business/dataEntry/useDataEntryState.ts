
import { useMemo } from 'react';
import { useDataEntriesQuery } from '@/hooks/api/dataEntry/useDataEntriesQuery';
import { useIndexedData } from '@/hooks/core/useIndexedData';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { DataEntry } from '@/types/dataEntry';

/**
 * Məlumat daxil etmə vəziyyətini idarə etmək üçün hook parametrləri
 */
export interface UseDataEntryStateProps {
  categoryId: string;
  schoolId: string;
  enabled?: boolean;
}

/**
 * Məlumat daxil etmə vəziyyətini idarə etmək üçün yüksək səviyyəli hook
 */
export function useDataEntryState({
  categoryId,
  schoolId,
  enabled = true
}: UseDataEntryStateProps) {
  // Current user əldə edirik
  const user = useAuthStore(selectUser);
  const session = useAuthStore(state => state.session);
  
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
    enabled: enabled && !!categoryId && !!schoolId
  });
  
  // UUID ilə indekslənmiş entries map
  const { 
    map: entriesMap, 
    getItem: getEntryByColumnId,
    hasItem: hasEntryForColumn
  } = useIndexedData(entries, 'column_id');
  
  // Mövcud entries-ləri kopyalayıb yeniləyən funksiya
  const updateEntryValue = (columnId: string, value: any) => {
    if (!columnId) {
      console.warn('Column ID is required for updating entry value');
      return;
    }

    const existingEntry = getEntryByColumnId(columnId);
    
    // Mövcud və ya yeni entry hazırlayırıq
    const updatedEntry = existingEntry 
      ? { 
          ...existingEntry, 
          value, 
          updated_at: new Date().toISOString() 
        }
      : {
          column_id: columnId,
          category_id: categoryId,
          school_id: schoolId,
          value,
          status: 'draft', // string kimi istifadə
          created_by: session?.user?.id || user?.id || null, // ✅ DÜZƏLDILDI: session user id istifadə et
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
    
    const actualUserId = session?.user?.id || user?.id;
    console.log('Updating entry value:', { columnId, value, updatedEntry, userId: actualUserId, sessionUserId: session?.user?.id, storeUserId: user?.id });
    
    // Yalnız bir entry yeniləyirik - user.id də göndəririk
    saveEntries([updatedEntry]);
  };
  
  // Bütün entries-ləri birdən yeniləyən funksiya
  const updateAllEntries = (updatedEntries: Partial<DataEntry>[]) => {
    if (!Array.isArray(updatedEntries) || updatedEntries.length === 0) {
      console.warn('No entries to update');
      return;
    }
    
    // ✅ DÜZƏLDILDI: Hər entry-yə user.id əlavə edirik
    const entriesWithUserId = updatedEntries.map(entry => ({
      ...entry,
      created_by: entry.created_by || session?.user?.id || user?.id || null,
      updated_at: new Date().toISOString()
    }));
    
    const actualUserId = session?.user?.id || user?.id;
    console.log('Updating all entries:', { count: entriesWithUserId.length, userId: actualUserId, sessionUserId: session?.user?.id, storeUserId: user?.id });
    saveEntries(entriesWithUserId);
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
    saveEntries,
    
    // User məlumatları
    user
  };
}

export default useDataEntryState;
