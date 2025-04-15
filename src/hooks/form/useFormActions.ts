
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { DataEntryForm, CategoryEntryData } from '@/types/dataEntry';

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
  const updateValue = useCallback((categoryId: string, columnId: string, value: any) => {
    setFormData(prevData => {
      // Verilmiş kateqoriya girişini tap
      const categoryEntryIndex = prevData.entries?.findIndex(entry => entry.categoryId === categoryId) ?? -1;
      
      if (categoryEntryIndex === -1) {
        // Kateqoriya girişi yoxdursa, yeni bir giriş yarat
        const newEntries = [...(prevData.entries || []), {
          categoryId,
          values: [{ columnId, value }],
          completionPercentage: 0
        }];
        
        return {
          ...prevData,
          entries: newEntries
        };
      } else {
        // Mövcud kateqoriya girişini güncəllə
        const entries = [...(prevData.entries || [])];
        const entry = entries[categoryEntryIndex];
        
        // Mövcud sütun dəyərini tap
        const valueIndex = entry.values.findIndex(v => v.columnId === columnId);
        
        if (valueIndex === -1) {
          // Sütun dəyəri yoxdursa, yeni bir dəyər əlavə et
          entry.values.push({ columnId, value });
        } else {
          // Mövcud sütun dəyərini güncəllə
          entry.values[valueIndex] = { ...entry.values[valueIndex], value };
        }
        
        // Başa çatma faizini hesabla
        const category = categories.find(c => c.id === categoryId);
        if (category) {
          const requiredColumns = category.columns.filter(col => col.is_required);
          const filledRequiredValues = entry.values.filter(val => {
            const column = category.columns.find(col => col.id === val.columnId);
            return column?.is_required && val.value && val.value.toString().trim() !== '';
          });
          
          entry.completionPercentage = requiredColumns.length > 0
            ? (filledRequiredValues.length / requiredColumns.length) * 100
            : 100;
          
          entry.isCompleted = entry.completionPercentage === 100;
        }
        
        entries[categoryEntryIndex] = entry;
        
        return {
          ...prevData,
          entries,
          lastSaved: new Date().toISOString()
        };
      }
    });
  }, [setFormData, categories]);
  
  // Formu saxlamaq üçün funksiya
  const saveForm = useCallback(() => {
    // Burada serverə məlumatları göndərməyi simulyasiya edirik
    // Real layihədə burada API çağırışı olacaq
    updateFormData({ lastSaved: new Date().toISOString() });
    
    return Promise.resolve();
  }, [updateFormData]);
  
  // Formu təsdiq üçün göndərmək funksiyası
  const submitForm = useCallback(() => {
    setIsSubmitting(true);
    
    // Serverə göndərmə simulyasiyası
    setTimeout(() => {
      updateFormData({ 
        lastSaved: new Date().toISOString(),
        status: 'submitted' as 'draft' | 'submitted' | 'approved' | 'rejected'
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
  const initializeForm = useCallback((entries: CategoryEntryData[], status: string = 'draft') => {
    setFormData({
      categories: [],
      overallCompletionPercentage: 0,
      entries,
      status: status as 'draft' | 'submitted' | 'approved' | 'rejected',
      lastSaved: new Date().toISOString()
    });
  }, [setFormData]);
  
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
