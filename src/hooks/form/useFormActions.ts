
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { DataEntryForm, EntryValue, CategoryEntryData } from '@/types/dataEntry';

export interface UseFormActionsProps {
  formData: DataEntryForm;
  setFormData: React.Dispatch<React.SetStateAction<DataEntryForm>>;
  updateFormData: (newData: Partial<DataEntryForm>) => void;
  categories: any[];
}

export const useFormActions = ({
  formData,
  setFormData,
  updateFormData,
  categories = []
}: UseFormActionsProps) => {
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form verilərini yeniləmək üçün funksiya
  const updateValue = useCallback((categoryId: string, columnId: string, newValue: any) => {
    setFormData(prevData => {
      // Verilmiş kateqoriya girişini tap
      const entryIndex = prevData.entries.findIndex(
        entry => entry.categoryId === categoryId && entry.columnId === columnId
      );
      
      const updatedEntries = [...prevData.entries];
      
      if (entryIndex === -1) {
        // Giriş yoxdursa, yeni bir giriş əlavə et
        updatedEntries.push({
          categoryId,
          columnId,
          value: newValue
        });
      } else {
        // Mövcud girişi yenilə
        updatedEntries[entryIndex] = {
          ...updatedEntries[entryIndex],
          value: newValue
        };
      }
      
      return {
        ...prevData,
        entries: updatedEntries
      };
    });
  }, [setFormData]);
  
  // Formu saxlamaq üçün funksiya
  const saveForm = useCallback(() => {
    // Burada serverə məlumatları göndərməyi simulyasiya edirik
    // Real layihədə burada API çağırışı olacaq
    updateFormData({ 
      lastSaved: new Date().toISOString()
    });
    
    return Promise.resolve();
  }, [updateFormData]);
  
  // Formu təsdiq üçün göndərmək funksiyası
  const submitForm = useCallback(() => {
    setIsSubmitting(true);
    
    // Serverə göndərmə simulyasiyası
    setTimeout(() => {
      updateFormData({ 
        submittedAt: new Date().toISOString(),
        status: 'pending'
      });
      
      setIsSubmitting(false);
      toast.success('Form təsdiq üçün göndərildi');
    }, 1000);
    
    return Promise.resolve();
  }, [updateFormData]);
  
  // Avtomatik saxlama üçün setup
  const setupAutoSave = useCallback(() => {
    const interval = setInterval(() => {
      if (formData.entries && formData.entries.length > 0) {
        setIsAutoSaving(true);
        saveForm().then(() => {
          setIsAutoSaving(false);
        });
      }
    }, 30000); // 30 saniyədə bir avtomatik saxla
    
    return () => clearInterval(interval);
  }, [formData.entries, saveForm]);
  
  // Formu başlatmaq üçün funksiya
  const initializeForm = useCallback((entries: EntryValue[], status: string = 'draft') => {
    setFormData({
      schoolId: formData.schoolId,
      categoryId: formData.categoryId,
      entries,
      status: status as 'draft' | 'pending' | 'approved' | 'rejected' | 'submitted',
      submittedAt: new Date().toISOString()
    });
  }, [setFormData, formData.schoolId, formData.categoryId]);
  
  return {
    isAutoSaving,
    isSubmitting,
    updateValue,
    saveForm,
    submitForm,
    setupAutoSave,
    initializeForm
  };
};
