import { useCallback, useMemo } from 'react';
import { useDataEntriesQuery } from '@/hooks/api/dataEntry/useDataEntriesQuery';
import { useCategoryQuery } from '@/hooks/api/categories/useCategoryQuery';
import { useIndexedData } from '@/hooks/core/useIndexedData';
import { DataEntry, DataEntryStatus } from '@/types/dataEntry';
import { useErrorHandler } from '@/hooks/core/useErrorHandler';

/**
 * Məlumat daxil etmə prosesini idarə etmək üçün hook parametrləri
 */
interface UseTestDataEntryProps {
  categoryId: string;
  schoolId: string;
}

/**
 * Test üçün yaradılmış hook - Data Entry prosesini idarə edir
 * Bu hook, yeni hook strukturunun necə işlədiyini göstərmək üçün
 * API hookları ilə business logic layer arasında körpü rolunu oynayır
 */
export function useTestDataEntry({ categoryId, schoolId }: UseTestDataEntryProps) {
  const { handleError } = useErrorHandler('DataEntry');
  
  // Kateqoriya və sütunları əldə edirik
  const {
    category,
    columns,
    isLoading: isCategoryLoading,
    error: categoryError
  } = useCategoryQuery({
    categoryId
  });
  
  // Məlumat daxil etmələri əldə edirik
  const {
    entries,
    isLoading: isEntriesLoading,
    saveEntries,
    updateStatus,
    isSaving,
    isUpdatingStatus
  } = useDataEntriesQuery({
    categoryId,
    schoolId
  });
  
  // UUID ilə indekslənmiş entrylər
  const { map: entriesMap, getItem: getEntryByColumnId } = useIndexedData(
    entries,
    'column_id'
  );
  
  // Xətaları emal edirik
  if (categoryError) {
    handleError(categoryError, 'Kateqoriya məlumatlarını əldə edərkən xəta baş verdi');
  }
  
  // Ümumi yüklənmə vəziyyəti
  const isLoading = isCategoryLoading || isEntriesLoading;
  
  // Məlumatları yeniləmək
  const updateEntry = useCallback(
    async (columnId: string, value: any) => {
      if (!categoryId || !schoolId) return;
      
      try {
        const existingEntry = getEntryByColumnId(columnId);
        
        if (existingEntry) {
          // Mövcud entry-ni yeniləyirik
          await saveEntries([
            {
              ...existingEntry,
              value,
              updated_at: new Date().toISOString()
            }
          ]);
        } else {
          // Yeni entry yaradırıq
          await saveEntries([
            {
              column_id: columnId,
              category_id: categoryId,
              school_id: schoolId,
              value,
              status: DataEntryStatus.DRAFT,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]);
        }
      } catch (error) {
        handleError(error, 'Məlumatı yeniləyərkən xəta baş verdi');
      }
    },
    [categoryId, schoolId, getEntryByColumnId, saveEntries, handleError]
  );
  
  // Tamamlanma faizini hesablayırıq
  const completionPercentage = useMemo(() => {
    if (!columns.length) return 0;
    return Math.round((Object.keys(entriesMap).length / columns.length) * 100);
  }, [columns.length, entriesMap]);
  
  return {
    // Data
    category,
    columns,
    entries,
    entriesMap,
    
    // Vəziyyət
    isLoading,
    isSaving,
    isUpdatingStatus,
    completionPercentage,
    
    // Əməliyyatlar
    updateEntry,
    updateStatus,
    getEntryByColumnId
  };
}

export default useTestDataEntry;
