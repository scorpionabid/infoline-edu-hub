import { useCallback, useEffect, useState } from 'react';
import { Category } from '@/types/category';
import { Column } from '@/types/column';
import { DataEntry } from '@/types/dataEntry';
import useDataEntries from './useDataEntries';
import { useAuth } from '@/context/AuthContext';

export const useDataEntry = (categoryId?: string, schoolId?: string) => {
  const [category, setCategory] = useState<Category | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [filteredColumns, setFilteredColumns] = useState<Column[]>([]);
  const [dataEntries, setDataEntries] = useState<Record<string, DataEntry>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [categoryStatus, setCategoryStatus] = useState<'draft' | 'pending' | 'approved' | 'rejected'>('draft');
  const [error, setError] = useState<Error | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const { user } = useAuth();

  // useDataEntries hooku istifadə edirik
  const { 
    entries, 
    loading: entriesLoading, 
    error: entriesError,
    fetchEntries,
    addEntry,
    updateEntry,
    deleteEntry,
    approveEntry,
    rejectEntry,
    submitCategoryForApproval
  } = useDataEntries();

  // Kategoriya məlumatlarını əldə et
  const fetchCategoryData = useCallback(async () => {
    if (!categoryId) return;

    setLoading(true);
    try {
      // Kategoriya əldə et (mock data olaraq istifadə edirik)
      const mockCategory: Category = {
        id: categoryId,
        name: 'Demo Kategoria',
        description: 'Demo kateqoriya təsviri',
        assignment: 'all',
        priority: 1,
        deadline: new Date().toISOString(),
        status: 'active',
        columnCount: 5,
      };
      setCategory(mockCategory);

      // Sütunları əldə et (mock data olaraq istifadə edirik)
      const mockColumns: Column[] = Array.from({ length: 5 }, (_, i) => ({
        id: `column-${i + 1}`,
        name: `Sütun ${i + 1}`,
        categoryId: categoryId,
        type: i % 3 === 0 ? 'text' : i % 3 === 1 ? 'number' : 'select',
        isRequired: i < 3,
        orderIndex: i,
        status: 'active',
        options: i % 3 === 2 ? ['Seçim 1', 'Seçim 2', 'Seçim 3'] : undefined,
        helpText: `Sütun ${i + 1} üçün kömək mətni`,
        placeholder: `Sütun ${i + 1} üçün nümunə`,
      }));
      setColumns(mockColumns);
      setFilteredColumns(mockColumns);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Kateqoriya məlumatlarını əldə edərkən xəta baş verdi'));
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  // Data entries əldə et
  const fetchDataEntriesForCategory = useCallback(async () => {
    if (!categoryId || !schoolId) return;

    setLoadingEntries(true);
    try {
      // Burada mockup data istifadə edirik. Real tətbiqdə supabase sorğusu olacaq
      const categoryEntries = entries.filter(
        entry => entry.category_id === categoryId && entry.school_id === schoolId
      );

      // Map entries by column_id for easy access
      const entriesMap: Record<string, DataEntry> = {};
      categoryEntries.forEach(entry => {
        entriesMap[entry.column_id] = entry;
      });

      setDataEntries(entriesMap);

      // Determine category status based on entries
      if (categoryEntries.length > 0) {
        // If any entry is rejected, category is rejected
        if (categoryEntries.some(entry => entry.status === 'rejected')) {
          setCategoryStatus('rejected');
        }
        // If all required entries are approved, category is approved
        else if (categoryEntries.every(entry => entry.status === 'approved')) {
          setCategoryStatus('approved');
        }
        // Otherwise it's pending
        else {
          setCategoryStatus('pending');
        }
      } else {
        setCategoryStatus('draft');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Məlumatları əldə edərkən xəta baş verdi'));
    } finally {
      setLoadingEntries(false);
    }
  }, [categoryId, schoolId, entries]);

  useEffect(() => {
    fetchCategoryData();
  }, [fetchCategoryData]);

  useEffect(() => {
    if (!entriesLoading) {
      fetchDataEntriesForCategory();
    }
  }, [fetchDataEntriesForCategory, entriesLoading]);

  // Yeni data entry əlavə et
  const handleDataChange = useCallback(
    async (columnId: string, value: string) => {
      if (!categoryId || !schoolId || !user) {
        console.error('Məlumat dəyişikliyi üçün lazımi məlumatlar çatışmır');
        return null;
      }

      setUnsavedChanges(true);

      // Update local state immediately for UI feedback
      setDataEntries(prev => ({
        ...prev,
        [columnId]: {
          ...(prev[columnId] || {}),
          id: prev[columnId]?.id || `temp-${columnId}`,
          column_id: columnId,
          category_id: categoryId,
          school_id: schoolId,
          value: value,
          status: 'pending',
          created_by: user.id,
        } as DataEntry,
      }));

      // Decide whether to update or create a new entry
      if (dataEntries[columnId]?.id && !dataEntries[columnId]?.id.startsWith('temp-')) {
        // Update existing entry
        try {
          await updateEntry(dataEntries[columnId].id, { value });
          setUnsavedChanges(false);
          return dataEntries[columnId];
        } catch (err) {
          console.error('Məlumat yeniləmə xətası:', err);
          return null;
        }
      } else {
        // Create new entry
        try {
          const newEntry = await addEntry({
            column_id: columnId,
            category_id: categoryId,
            school_id: schoolId,
            value: value,
            status: 'pending',
            created_by: user.id,
          });
          if (newEntry) {
            setDataEntries(prev => ({
              ...prev,
              [columnId]: newEntry,
            }));
            setUnsavedChanges(false);
            return newEntry;
          }
          return null;
        } catch (err) {
          console.error('Məlumat əlavə etmə xətası:', err);
          return null;
        }
      }
    },
    [categoryId, schoolId, user, dataEntries, updateEntry, addEntry]
  );

  // Kateqoriyani təsdiqə göndər
  const handleSubmitForApproval = useCallback(async () => {
    if (!categoryId || !schoolId) {
      console.error('Təsdiq üçün lazımi məlumatlar çatışmır');
      return false;
    }

    setSubmitting(true);
    try {
      // Check if all required fields have entries
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
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Təsdiq prosesi zamanı xəta baş verdi'));
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [categoryId, schoolId, columns, dataEntries, submitCategoryForApproval]);

  return {
    category,
    columns,
    filteredColumns,
    dataEntries,
    loading: loading || entriesLoading,
    loadingEntries,
    submitting,
    categoryStatus,
    error: error || entriesError,
    unsavedChanges,
    handleDataChange,
    handleSubmitForApproval,
    refreshData: fetchDataEntriesForCategory
  };
};

export default useDataEntry;
