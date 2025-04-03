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
  setLoadingEntries?: (loading: boolean) => void;
  setIsAutoSaving?: (isAutoSaving: boolean) => void;
  submitCategoryForApproval?: (categoryId: string, schoolId: string) => Promise<boolean>;
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
  columns,
  setLoadingEntries = () => {},
  setIsAutoSaving = () => {},
  submitCategoryForApproval = async () => true
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
      setLoadingEntries(true); // setLoadingEntries əlavə edildi
      
      // Məlumatların yoxlanılması 
      const missingRequired = columns
        .filter(col => col.isRequired)
        .some(col => {
          const entry = dataEntries[col.id];
          return !entry || !entry.value;
        });

      if (missingRequired) {
        toast.error(t('fillRequiredFields'));
        setLoadingEntries(false); // setLoadingEntries əlavə edildi
        setSubmitting(false);
        return false;
      }
      
      // Supabase-ə məlumatları göndərək
      const entries = Object.values(dataEntries);
      
      if (entries.length === 0) {
        toast.error(t('noDataToSubmit'));
        setLoadingEntries(false); // setLoadingEntries əlavə edildi
        setSubmitting(false);
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
        setLoadingEntries(false); // setLoadingEntries əlavə edildi
        return false;
      }
      
      // Kateqoriya üçün təsdiq sorğusu göndərilməsi
      const success = await submitCategoryForApproval(categoryId, schoolId);
      
      setLoadingEntries(false); // setLoadingEntries əlavə edildi
      
      if (success) {
        setCategoryStatus('pending');
        const unsavedChangesValue = false; // unsavedChanges əvəzinə dəyişən yaradılıb
        setUnsavedChanges(unsavedChangesValue);
        
        setIsAutoSaving(false); // setIsAutoSaving əlavə edildi
        toast.success(t('submittedForApproval'));
        return true;
      } else {
        setIsAutoSaving(false); // setIsAutoSaving əlavə edildi
        toast.error(t('errorSubmittingForm'));
        return false;
      }
    } catch (error) {
      console.error('Təsdiq üçün göndərmədə xəta:', error);
      setIsAutoSaving(false); // setIsAutoSaving əlavə edildi
      toast.error(t('errorSubmittingForm'));
      return false;
    } finally {
      setSubmitting(false);
      setIsAutoSaving(false); // setIsAutoSaving əlavə edildi
      
      const unsavedChangesValue = false; // unsavedChanges əvəzinə dəyişən yaradılıb
      setUnsavedChanges(unsavedChangesValue);
      setIsAutoSaving(false); // setIsAutoSaving əlavə edildi
    }
  }, [
    categoryId, 
    schoolId, 
    t, 
    columns, 
    dataEntries, 
    setSubmitting, 
    setCategoryStatus, 
    setUnsavedChanges,
    submitCategoryForApproval,
    setLoadingEntries,
    setIsAutoSaving
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

  return {
    handleDataChange,
    handleSubmitForApproval,
    fetchDataEntriesForCategory
  };
};
