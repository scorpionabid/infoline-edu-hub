
import { useCallback, useEffect, useState } from 'react';
import { Category } from '@/types/category';
import { Column } from '@/types/column';
import { EntryValue, CategoryEntryData, ColumnEntry, DataEntryStatus } from '@/types/dataEntry';
import { DataEntry } from '@/types/supabase';
import { useDataEntries } from './useDataEntries';
import { useAuth } from '@/context/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { generateId } from '@/utils/generateId';

export interface CategoryWithData extends Category {
  columns: Column[];
}

export const useDataEntry = (categoryId?: string, schoolId?: string) => {
  const [category, setCategory] = useState<Category | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [filteredColumns, setFilteredColumns] = useState<Column[]>([]);
  const [dataEntries, setDataEntries] = useState<Record<string, DataEntry>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [categoryStatus, setCategoryStatus] = useState<DataEntryStatus>('draft');
  const [error, setError] = useState<Error | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [categories, setCategories] = useState<CategoryWithData[]>([]);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [formData, setFormData] = useState({
    status: 'draft' as DataEntryStatus,
    entries: [] as CategoryEntryData[],
    lastSaved: '',
    overallProgress: 0
  });
  const [errors, setErrors] = useState<Array<{columnId: string, message: string}>>([]);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  const { user } = useAuth();

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

  const fetchCategoryData = useCallback(async () => {
    if (!categoryId) return;

    setLoading(true);
    try {
      const mockCategory: Category = {
        id: categoryId,
        name: 'Demo Kategoria',
        description: 'Demo kateqoriya təsviri',
        assignment: 'all',
        priority: 1,
        deadline: new Date().toISOString(),
        status: 'active',
        columnCount: 5,
        order: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setCategory(mockCategory);

      const mockColumns: Column[] = Array.from({ length: 5 }, (_, i) => ({
        id: `column-${i + 1}`,
        name: `Sütun ${i + 1}`,
        categoryId: categoryId,
        type: i % 3 === 0 ? 'text' : i % 3 === 1 ? 'number' : 'select',
        isRequired: i < 3,
        orderIndex: i,
        status: 'active',
        order: i,
        options: i % 3 === 2 ? ['Seçim 1', 'Seçim 2', 'Seçim 3'] : undefined,
        helpText: `Sütun ${i + 1} üçün kömək mətni`,
        placeholder: `Sütun ${i + 1} üçün nümunə`,
      }));
      setColumns(mockColumns);
      setFilteredColumns(mockColumns);

      setCategories([
        {
          ...mockCategory,
          columns: mockColumns
        }
      ]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Kateqoriya məlumatlarını əldə edərkən xəta baş verdi'));
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  const fetchDataEntriesForCategory = useCallback(async () => {
    if (!categoryId || !schoolId) return;

    setLoadingEntries(true);
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

      if (dataEntries[columnId] && dataEntries[columnId].id && !dataEntries[columnId].id.startsWith('temp-')) {
        try {
          await updateEntry(dataEntries[columnId].id, { value });
          setUnsavedChanges(false);
          return dataEntries[columnId];
        } catch (err) {
          console.error('Məlumat yeniləmə xətası:', err);
          return null;
        }
      } else {
        try {
          const newEntryData = {
            column_id: columnId,
            category_id: categoryId,
            school_id: schoolId,
            value: value,
            status: 'pending',
            created_by: user.id,
          };
          const newEntry = await addEntry(newEntryData);
          if (newEntry) {
            setDataEntries(prev => ({
              ...prev,
              [columnId]: {
                ...newEntry,
                status: newEntry.status as DataEntryStatus
              },
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

  const changeCategory = useCallback((index: number) => {
    if (index >= 0 && index < categories.length) {
      setCurrentCategoryIndex(index);
    }
  }, [categories]);

  const saveForm = useCallback(() => {
    console.log('Form saxlanıldı');
    setFormData(prev => ({
      ...prev,
      lastSaved: new Date().toISOString()
    }));
  }, []);

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
      setError(err instanceof Error ? err : new Error('Təsdiq prosesi zamanı xəta baş verdi'));
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [categoryId, schoolId, columns, dataEntries, submitCategoryForApproval]);

  const downloadExcelTemplate = useCallback((categoryId: string) => {
    console.log(`Excel şablonu yüklənir: ${categoryId}`);
  }, []);

  const uploadExcelData = useCallback((file: File, categoryId: string) => {
    console.log(`Excel məlumatları yüklənir: ${file.name}, categoryId: ${categoryId}`);
  }, []);

  const getErrorForColumn = useCallback((columnId: string) => {
    const error = errors.find(e => e.columnId === columnId);
    return error ? error.message : undefined;
  }, [errors]);

  return {
    category,
    columns,
    filteredColumns,
    dataEntries,
    loading,
    loadingEntries,
    submitting,
    categoryStatus,
    error: error || entriesError,
    unsavedChanges,
    categories,
    currentCategoryIndex,
    formData,
    isAutoSaving,
    isSubmitting: submitting,
    isLoading: loading,
    errors,
    handleDataChange,
    handleSubmitForApproval,
    refreshData: fetchDataEntriesForCategory,
    changeCategory,
    updateValue: handleDataChange,
    submitForApproval: handleSubmitForApproval,
    saveForm,
    getErrorForColumn,
    downloadExcelTemplate,
    uploadExcelData
  };
};

export default useDataEntry;
