
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DataEntry, DataEntryStatus } from '@/types/dataEntry';
import { Column } from '@/types/column';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

interface UseDataEntryActionsProps {
  categoryId?: string;
  schoolId?: string;
  user: any;
  dataEntries: Record<string, DataEntry>;
  setDataEntries: (entries: Record<string, DataEntry>) => void;
  setCategoryStatus: (status: DataEntryStatus) => void;
  setUnsavedChanges: (hasChanges: boolean) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  entries?: any[];
  submitCategoryForApproval?: (categoryId: string, schoolId: string) => Promise<boolean>;
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
  entries = [],
  submitCategoryForApproval,
  setFormData,
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
          id: entryId,                   // ID həmişə olmalıdır
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
      
      // Server-ə göndərmə
      const success = await submitCategoryForApproval?.(categoryId, schoolId);
      
      if (success) {
        setCategoryStatus('pending');
        setUnsavedChanges(false);
        toast.success(t('submittedForApproval'));
        
        // Form məlumatlarını yenilə
        setFormData(prev => ({
          ...prev,
          status: 'pending' as DataEntryStatus,
          lastSaved: new Date().toISOString()
        }));
        
        return true;
      } else {
        toast.error(t('errorSubmittingForm'));
        return false;
      }
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
    submitCategoryForApproval, 
    setSubmitting, 
    setCategoryStatus, 
    setUnsavedChanges,
    setFormData
  ]);

  // Kateqoriya üçün mövcud məlumatları yüklə
  const fetchDataEntriesForCategory = useCallback(() => {
    if (!categoryId || !schoolId) return;
    
    // Burada API çağırışı olacaq, hələlik dummy data ilə əvəz edirik
    const dummyEntries = entries.reduce((acc, entry) => {
      if (entry.category_id === categoryId && entry.school_id === schoolId) {
        return {
          ...acc,
          [entry.column_id]: {
            id: entry.id,
            category_id: entry.category_id,
            column_id: entry.column_id,
            school_id: entry.school_id,
            value: entry.value,
            status: entry.status,
            created_at: entry.created_at,
            updated_at: entry.updated_at,
            created_by: entry.created_by
          } as DataEntry
        };
      }
      return acc;
    }, {} as Record<string, DataEntry>);
    
    setDataEntries(dummyEntries);
    
    // Status-u təyin et
    const categoryEntry = entries.find(e => e.category_id === categoryId);
    if (categoryEntry) {
      setCategoryStatus(categoryEntry.status as DataEntryStatus);
    }
  }, [categoryId, schoolId, entries, setDataEntries, setCategoryStatus]);

  return {
    handleDataChange,
    handleSubmitForApproval,
    fetchDataEntriesForCategory
  };
};
