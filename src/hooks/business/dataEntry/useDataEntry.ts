import { useMemo, useState } from 'react';
import { useCategoryQuery } from '@/hooks/api/categories/useCategoryQuery';
import { useDataEntryState } from './useDataEntryState';
import { Column } from '@/types/column';
import { DataEntry, DataEntryStatus } from '@/types/dataEntry';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';

/**
 * Məlumat daxil etmə formasını idarə etmək üçün hook parametrləri
 */
export interface UseDataEntryProps {
  categoryId: string;
  schoolId: string;
  onComplete?: () => void;
}

/**
 * Məlumat daxil etmə formasını idarə etmək üçün əsas hook
 * 
 * Bu hook aşağıdakı funksionallığı təmin edir:
 * - Kateqoriya və sütun məlumatlarını əldə etmək
 * - Məlumat daxil etmələrini əldə etmək və idarə etmək
 * - Tamamlanma faizini hesablamaq
 * - Bütün məlumatların doldurulduğunu yoxlamaq
 * - Məlumatları yadda saxlamaq və statusunu yeniləmək
 * 
 * @param props Hook parametrləri
 * @returns Məlumat daxil etmə forması vəziyyəti və əlaqədar funksiyalar
 */
export function useDataEntry({ categoryId, schoolId, onComplete }: UseDataEntryProps) {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Kateqoriya və sütunlarını əldə edirik
  const {
    category,
    columns,
    isLoading: isCategoryLoading,
    isError: isCategoryError,
    error: categoryError,
    refetch: refetchCategory
  } = useCategoryQuery({ 
    categoryId,
    enabled: !!categoryId
  });
  
  // Məlumat daxil etmələrini əldə edirik
  const {
    entries,
    entriesMap,
    getEntryByColumnId,
    hasEntryForColumn,
    isLoading: isDataLoading,
    isError: isDataError,
    error: dataError,
    updateEntryValue,
    updateAllEntries,
    updateStatus,
    refetch: refetchData,
    isSaving,
    isUpdatingStatus
  } = useDataEntryState({ 
    categoryId, 
    schoolId,
    enabled: !!categoryId && !!schoolId
  });
  
  // Ümumi yüklənmə və xəta vəziyyətləri
  const isLoading = isCategoryLoading || isDataLoading;
  const isError = isCategoryError || isDataError;
  const error = categoryError || dataError;
  
  // Sütunların təhlükəsiz versiyasını hazırlayırıq
  const safeColumns = useMemo(() => {
    return Array.isArray(columns) ? columns.filter(Boolean) : [];
  }, [columns]);
  
  // Bütün tələb olunan sütunların doldurulduğunu yoxlayırıq
  const hasAllRequiredData = useMemo(() => {
    if (!safeColumns.length) return false;
    
    return safeColumns
      .filter(column => column.is_required)
      .every(column => {
        const entry = getEntryByColumnId(column.id);
        return !!entry && !!entry.value && entry.value.toString().trim() !== '';
      });
  }, [safeColumns, getEntryByColumnId]);
  
  // Tamamlanma faizini hesablayırıq
  const completionPercentage = useMemo(() => {
    if (!safeColumns.length) return 0;
    
    const filledColumns = safeColumns.filter(column => {
      const entry = getEntryByColumnId(column.id);
      return !!entry && !!entry.value && entry.value.toString().trim() !== '';
    }).length;
    
    return Math.round((filledColumns / safeColumns.length) * 100);
  }, [safeColumns, getEntryByColumnId]);
  
  // Bütün məlumatları yeniləmək üçün funksiya
  const saveAll = async () => {
    if (isSaving) return;
    
    try {
      // Bütün sütunlar üçün entries yaradırıq/yeniləyirik
      const entriesToSave = safeColumns.map(column => {
        const existingEntry = getEntryByColumnId(column.id);
        
        return existingEntry 
          ? { ...existingEntry }
          : {
              column_id: column.id,
              category_id: categoryId,
              school_id: schoolId,
              value: '',
              status: DataEntryStatus.DRAFT
            };
      });
      
      await updateAllEntries(entriesToSave);
      toast.success(t('dataEntriesSaved'));
    } catch (error) {
      console.error('Error saving all entries:', error);
    }
  };
  
  // Bütün məlumatları təqdim etmək üçün funksiya
  const submitAll = async () => {
    if (isSubmitting || isUpdatingStatus) return;
    
    if (!hasAllRequiredData) {
      toast.error(t('fillAllRequiredFields'));
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Status yeniləməsi üçün entries hazırlayırıq
      const entriesToUpdate = entries.filter(entry => 
        entry.status !== 'submitted' // DataEntryStatus.SUBMITTED, string olaraq istifadə edirik
      );
      
      if (entriesToUpdate.length === 0) {
        toast.info(t('allDataAlreadySubmitted'));
        setIsSubmitted(true);
        if (onComplete) onComplete();
        return;
      }
      
      // Statusu yeniləyirik
      await updateStatus({
        entries: entriesToUpdate,
        status: 'submitted' as DataEntryStatus // DataEntryStatus.SUBMITTED, string olaraq istifadə edirik
      });
      
      toast.success(t('dataEntriesSubmitted'));
      setIsSubmitted(true);
      
      if (onComplete) onComplete();
    } catch (error) {
      console.error('Error submitting entries:', error);
      toast.error(t('errorSubmittingEntries'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Bütün məlumatları yeniləmək üçün funksiya
  const refetchAll = async () => {
    await Promise.all([refetchCategory(), refetchData()]);
  };
  
  // Sütun üçün məlumatı əldə etmək üçün köməkçi funksiya
  const getValueForColumn = (column: Column): string => {
    const entry = getEntryByColumnId(column.id);
    return entry?.value ?? '';
  };
  
  // Hook nəticələrini qaytarırıq
  return {
    // Data və status
    category,
    columns: safeColumns,
    entries,
    entriesMap,
    isLoading,
    isError,
    error,
    isSaving,
    isSubmitting,
    isSubmitted,
    
    // Hesablanmış dəyərlər
    completionPercentage,
    hasAllRequiredData,
    
    // Məlumat əldə etmə funksiyaları
    getEntryByColumnId,
    hasEntryForColumn,
    getValueForColumn,
    
    // Əməliyyat funksiyaları
    updateEntryValue,
    updateAllEntries,
    saveAll,
    submitAll,
    refetchAll
  };
}

export default useDataEntry;
