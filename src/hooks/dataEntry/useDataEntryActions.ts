
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DataEntry, DataEntryStatus } from '@/types/dataEntry';
import { Column } from '@/types/column';

interface UseDataEntryActionsProps {
  categoryId?: string;
  schoolId?: string;
  user: any;
  dataEntries: Record<string, DataEntry>;
  setDataEntries: (data: Record<string, DataEntry> | ((prev: Record<string, DataEntry>) => Record<string, DataEntry>)) => void;
  setCategoryStatus: (status: DataEntryStatus) => void;
  setUnsavedChanges: (value: boolean) => void;
  setSubmitting: (value: boolean) => void;
  entries: DataEntry[];
  submitCategoryForApproval: (categoryId: string, schoolId: string) => Promise<boolean>;
  setFormData: (data: any) => void;
  columns: Column[];
}

export const useDataEntryActions = ({
  categoryId,
  schoolId,
  user,
  dataEntries,
  setDataEntries,
  setCategoryStatus,
  setUnsavedChanges,
  setSubmitting,
  entries,
  submitCategoryForApproval,
  setFormData,
  columns
}: UseDataEntryActionsProps) => {
  const handleDataChange = useCallback(
    async (columnId: string, value: string) => {
      if (!categoryId || !schoolId || !user) {
        console.error('Məlumat dəyişikliyi üçün lazımi məlumatlar çatışmır');
        return null;
      }

      setUnsavedChanges(true);

      // Burada idempotent bir ID yaradaq və məlumatları yeniləyək
      const entryId = dataEntries[columnId]?.id || `temp-${uuidv4()}`;
      
      // Əmin olaq ki, id həmişə təyin olunub və optional deyil
      setDataEntries(prev => ({
        ...prev,
        [columnId]: {
          id: entryId, 
          column_id: columnId,
          category_id: categoryId,
          school_id: schoolId,
          value: value,
          status: dataEntries[columnId]?.status || 'pending',
          created_by: user.id,
        } as DataEntry, // Tip düzəltməsi
      }));

      // Mövcud və ya yeni bir məlumat daxil edilərsə müvafiq əməliyyat yerinə yetirək
      if (dataEntries[columnId] && dataEntries[columnId].id && !dataEntries[columnId].id.startsWith('temp-')) {
        try {
          // updateEntry funksiyası artıq mövcud olmadığından bu hissəni commenz alıb saxlayırıq
          // Gerçək tətbiqlərdə burada serverlə əlaqə yaradılmalıdır
          // await updateEntry(dataEntries[columnId].id, { value });
          setUnsavedChanges(false);
          return dataEntries[columnId];
        } catch (err) {
          console.error('Məlumat yeniləmə xətası:', err);
          return null;
        }
      } else {
        try {
          const newEntryData = {
            id: entryId, // id xassəsi təyin edilib
            column_id: columnId,
            category_id: categoryId,
            school_id: schoolId,
            value: value,
            status: 'pending',
            created_by: user.id,
          } as DataEntry;
          
          // addEntry funksiyası artıq mövcud olmadığından bu hissəni commenz alıb saxlayırıq
          // Gerçək tətbiqlərdə burada serverlə əlaqə yaradılmalıdır
          // const newEntry = await addEntry(newEntryData);
          setDataEntries(prev => ({
            ...prev,
            [columnId]: newEntryData,
          }));
          setUnsavedChanges(false);
          return newEntryData;
        } catch (err) {
          console.error('Məlumat əlavə etmə xətası:', err);
          return null;
        }
      }
    },
    [categoryId, schoolId, user, dataEntries, setDataEntries, setUnsavedChanges]
  );

  const handleSubmitForApproval = useCallback(async () => {
    if (!categoryId || !schoolId) {
      console.error('Təsdiq üçün lazımi məlumatlar çatışmır');
      return false;
    }

    setSubmitting(true);
    try {
      const requiredColumns = columns.filter(col => col.isRequired);
      const allRequiredFilled = requiredColumns.every(col => 
        dataEntries[col.id] && dataEntries[col.id].value && dataEntries[col.id].value.trim() !== ''
      );

      if (!allRequiredFilled) {
        throw new Error('Bütün məcburi sahələr doldurulmalıdır');
      }

      const success = await submitCategoryForApproval(categoryId, schoolId);
      if (success) {
        setCategoryStatus('pending');
        setFormData(prev => ({
          ...prev,
          status: 'submitted'
        }));
      }
      return success;
    } catch (err) {
      console.error('Təsdiq prosesi zamanı xəta:', err);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [categoryId, schoolId, columns, dataEntries, submitCategoryForApproval, setSubmitting, setCategoryStatus, setFormData]);

  const fetchDataEntriesForCategory = useCallback(async () => {
    if (!categoryId || !schoolId) return;

    try {
      const categoryEntries = entries.filter(
        entry => entry.category_id === categoryId && entry.school_id === schoolId
      );

      const entriesMap: Record<string, DataEntry> = {};
      categoryEntries.forEach(entry => {
        entriesMap[entry.column_id] = {
          ...entry,
          status: (entry.status as DataEntryStatus) || 'draft',
        };
      });

      setDataEntries(entriesMap);

      if (categoryEntries.length > 0) {
        if (categoryEntries.some(entry => entry.status === 'rejected')) {
          setCategoryStatus('rejected');
        } else if (categoryEntries.every(entry => entry.status === 'approved')) {
          setCategoryStatus('approved');
        } else {
          setCategoryStatus('pending');
        }
      } else {
        setCategoryStatus('draft');
      }
    } catch (err) {
      console.error('Məlumatları əldə edərkən xəta:', err);
    }
  }, [categoryId, schoolId, entries, setDataEntries, setCategoryStatus]);

  return {
    handleDataChange,
    handleSubmitForApproval,
    fetchDataEntriesForCategory
  };
};
