
import { useState, useCallback } from 'react';
import { CategoryWithColumns } from '@/types/column';
import { DataEntryForm, CategoryEntryData, EntryValue } from '@/types/dataEntry';
import { toast } from '@/components/ui/use-toast';
import { useLanguage } from '@/context/LanguageContext';

export const useForm = (categories: CategoryWithColumns[]) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<DataEntryForm>({
    formId: "form1",
    schoolId: "school1",
    entries: [],
    overallProgress: 0,
    status: 'draft'
  });
  const [isAutoSaving, setIsAutoSaving] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Formanı ilkin məlumatlarla doldurmaq
  const initializeForm = useCallback((initialEntries: CategoryEntryData[], formStatus: 'draft' | 'submitted' | 'approved' | 'rejected' = 'draft') => {
    setFormData(prev => ({
      ...prev,
      entries: initialEntries,
      lastSaved: new Date().toISOString(),
      status: formStatus
    }));
  }, []);
  
  // Dəyəri yeniləmək
  const updateValue = useCallback((categoryId: string, columnId: string, value: any) => {
    setFormData(prev => {
      const newEntries = [...prev.entries];
      const categoryIndex = newEntries.findIndex(entry => entry.categoryId === categoryId);
      
      if (categoryIndex !== -1) {
        const valueIndex = newEntries[categoryIndex].values.findIndex(v => v.columnId === columnId);
        
        if (valueIndex !== -1) {
          newEntries[categoryIndex].values[valueIndex] = {
            ...newEntries[categoryIndex].values[valueIndex],
            value,
            status: 'pending'
          };
          
          // Əgər əvvəlcədən xəta var idisə, silək
          delete newEntries[categoryIndex].values[valueIndex].errorMessage;
        } else {
          newEntries[categoryIndex].values.push({
            columnId,
            value,
            status: 'pending'
          });
        }
      }
      
      // Kateqoriya tamamlanma faizini yeniləmək
      newEntries.forEach(entry => {
        const category = categories.find(c => c.id === entry.categoryId);
        if (category) {
          const requiredColumns = category.columns.filter(col => col.isRequired);
          const filledRequiredValues = entry.values.filter(val => {
            const column = category.columns.find(col => col.id === val.columnId);
            return column?.isRequired && val.value !== '' && val.value !== null && val.value !== undefined;
          });
          
          entry.completionPercentage = requiredColumns.length > 0 
            ? (filledRequiredValues.length / requiredColumns.length) * 100 
            : 100;
          
          entry.isCompleted = entry.completionPercentage === 100;
        }
      });
      
      // Ümumi tamamlanma faizini yeniləmək
      const overallProgress = newEntries.reduce((sum, entry) => sum + entry.completionPercentage, 0) / newEntries.length;
      
      setIsAutoSaving(true);
      
      return {
        ...prev,
        entries: newEntries,
        overallProgress,
        lastSaved: new Date().toISOString()
      };
    });
  }, [categories]);
  
  // Manuel saxlama
  const saveForm = useCallback(() => {
    // Burada real API çağırışı olmalıdır
    console.log("Məlumatlar manual saxlanıldı:", formData);
    
    toast({
      title: t('changesAutoSaved'),
      variant: "default",
    });
    
    setFormData(prev => ({
      ...prev,
      lastSaved: new Date().toISOString()
    }));
  }, [formData, t]);
  
  // Təsdiq üçün göndərmək
  const submitForm = useCallback((validateFn: () => boolean) => {
    const isValid = validateFn();
    
    if (isValid) {
      setIsSubmitting(true);
      
      // API çağırışı simulyasiyası
      setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          status: 'submitted',
          entries: prev.entries.map(entry => ({
            ...entry,
            isSubmitted: true,
            approvalStatus: 'pending'
          }))
        }));
        
        setIsSubmitting(false);
        
        toast({
          title: t('submissionSuccess'),
          description: t('submissionDescription'),
          variant: "default",
        });
      }, 2000);
      return true;
    } else {
      toast({
        title: "Xəta",
        description: "Zəhmət olmasa bütün məcburi sahələri doldurun",
        variant: "destructive",
      });
      return false;
    }
  }, [t]);
  
  // Auto saxlama simulyasiyası
  const setupAutoSave = useCallback((validateFn: () => void) => {
    if (isAutoSaving) {
      const timer = setTimeout(() => {
        // Burada real API çağırışı olmalıdır
        console.log("Məlumatlar avtomatik saxlanıldı:", formData);
        setIsAutoSaving(false);
        
        toast({
          title: t('changesAutoSaved'),
          variant: "default",
        });
        
        // Məlumatları saxladıqdan sonra validasiya etmək
        validateFn();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [formData, isAutoSaving, t]);
  
  return {
    formData,
    isAutoSaving,
    isSubmitting,
    setIsSubmitting,
    updateValue,
    saveForm,
    submitForm,
    setupAutoSave,
    initializeForm
  };
};
