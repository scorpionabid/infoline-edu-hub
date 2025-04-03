
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DataEntry, DataEntryStatus } from '@/types/dataEntry';
import { Column } from '@/types/column';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface UseDataEntryActionsProps {
  categoryId?: string;
  schoolId?: string;
  user: any;
  dataEntries: Record<string, DataEntry>;
  setDataEntries: React.Dispatch<React.SetStateAction<Record<string, DataEntry>>>;
  setCategoryStatus: (status: DataEntryStatus) => void;
  setUnsavedChanges: (hasChanges: boolean) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  entries?: any[];
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
  entries = [],
  columns
}: UseDataEntryActionsProps) => {
  const { t } = useLanguage();

  // Sütun üçün məlumat daxil etmə əməliyyatı
  const handleDataChange = useCallback((columnId: string, value: string) => {
    setDataEntries((prev) => {
      // Mövcud daxiletmə əməliyyatını yoxlayırıq
      const existingEntry = prev[columnId];
      
      // ID hər zaman təyin olunmalıdır, mövcuddursa istifadə et, yoxdursa yeni yarat
      const entryId = existingEntry?.id || uuidv4();
      
      const updatedEntries = {
        ...prev,
        [columnId]: {
          id: entryId,
          category_id: categoryId || '',
          column_id: columnId,
          school_id: schoolId || '',
          value,
          status: existingEntry?.status || 'draft',
          created_by: user?.id,
          updated_at: new Date().toISOString(),
          created_at: existingEntry?.created_at || new Date().toISOString(),
        } as DataEntry
      };
      
      return updatedEntries;
    });
    
    setUnsavedChanges(true);
  }, [categoryId, schoolId, user, setDataEntries, setUnsavedChanges]);

  // Təsdiq üçün göndərmə əməliyyatı
  const handleSubmitForApproval = useCallback(async () => {
    if (!categoryId || !schoolId) {
      toast.error(t('missingRequiredData'));
      return false;
    }

    try {
      setSubmitting(true);
      
      // Məlumatların yoxlanılması 
      const missingRequired = columns
        .filter(col => col.isRequired)
        .some(col => {
          const entry = dataEntries[col.id];
          return !entry || !entry.value;
        });

      if (missingRequired) {
        toast.error(t('fillRequiredFields'));
        return false;
      }
      
      // Supabase-ə məlumatları göndərək
      const entries = Object.values(dataEntries);
      
      if (entries.length === 0) {
        toast.error(t('noDataToSubmit'));
        return false;
      }
      
      // Supabase-ə məlumatları göndərək
      const { error } = await supabase.from('data_entries').upsert(
        entries.map(entry => ({
          id: entry.id,
          category_id: entry.category_id,
          column_id: entry.column_id,
          school_id: entry.school_id,
          value: entry.value,
          status: 'pending',
          created_by: entry.created_by,
          updated_at: new Date().toISOString(),
          created_at: entry.created_at
        }))
      );

      if (error) {
        console.error('Məlumatları göndərərkən xəta:', error);
        toast.error(t('errorSubmittingData'));
        return false;
      }
      
      setCategoryStatus('pending');
      setUnsavedChanges(false);
      toast.success(t('submittedForApproval'));
      
      return true;
    } catch (error) {
      console.error('Təsdiq üçün göndərmədə xəta:', error);
      toast.error(t('errorSubmittingForm'));
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [
    categoryId, 
    schoolId, 
    t, 
    columns, 
    dataEntries, 
    setSubmitting, 
    setCategoryStatus, 
    setUnsavedChanges
  ]);

  // Kateqoriya üçün mövcud məlumatları yüklə
  const fetchDataEntriesForCategory = useCallback(async () => {
    if (!categoryId || !schoolId) return;
    
    try {
      setLoadingEntries(true);
      
      // Supabase-dən məlumatları əldə edək
      const { data, error } = await supabase
        .from('data_entries')
        .select('*')
        .eq('category_id', categoryId)
        .eq('school_id', schoolId);
      
      if (error) {
        console.error('Məlumatları gətirərkən xəta:', error);
        toast.error(t('errorFetchingData'));
        setLoadingEntries(false);
        return;
      }
      
      // Məlumatları state-ə yerləşdirək
      const entriesMap = (data || []).reduce((acc, entry) => {
        return {
          ...acc,
          [entry.column_id]: entry as DataEntry
        };
      }, {} as Record<string, DataEntry>);
      
      setDataEntries(entriesMap);
      
      // Kateqoriyanın statusunu təyin edək
      if (data && data.length > 0) {
        // Bütün məlumatların eyni statusu olduğunu fərz edirik
        const categoryStatus = data[0].status as DataEntryStatus;
        setCategoryStatus(categoryStatus);
      }
      
      setLoadingEntries(false);
    } catch (error) {
      console.error('Məlumatları gətirərkən xəta:', error);
      toast.error(t('errorFetchingData'));
      setLoadingEntries(false);
    }
  }, [categoryId, schoolId, t, setDataEntries, setCategoryStatus, setLoadingEntries]);

  // Avtomatik yadda saxlama
  const autoSaveEntries = useCallback(async () => {
    if (!categoryId || !schoolId || !unsavedChanges) return;
    
    try {
      setIsAutoSaving(true);
      
      const entries = Object.values(dataEntries);
      
      if (entries.length === 0) {
        setIsAutoSaving(false);
        return;
      }
      
      // Draft kimi yadda saxla
      const { error } = await supabase.from('data_entries').upsert(
        entries.map(entry => ({
          id: entry.id,
          category_id: entry.category_id,
          column_id: entry.column_id,
          school_id: entry.school_id,
          value: entry.value,
          status: 'draft',
          created_by: entry.created_by,
          updated_at: new Date().toISOString(),
          created_at: entry.created_at
        }))
      );

      if (error) {
        console.error('Avtomatik yadda saxlayarkən xəta:', error);
        setIsAutoSaving(false);
        return;
      }
      
      setUnsavedChanges(false);
      console.log('Avtomatik yadda saxlandı:', new Date().toISOString());
    } catch (error) {
      console.error('Avtomatik yadda saxlayarkən xəta:', error);
    } finally {
      setIsAutoSaving(false);
    }
  }, [categoryId, schoolId, unsavedChanges, dataEntries, setIsAutoSaving, setUnsavedChanges]);

  return {
    handleDataChange,
    handleSubmitForApproval,
    fetchDataEntriesForCategory,
    autoSaveEntries
  };
};
