
import { useCallback, useRef } from 'react';
import { CategoryWithColumns } from '@/types/column';
import { DataEntryForm } from '@/types/dataEntry';
import { toast } from '@/components/ui/use-toast';
import { useLanguage } from '@/context/LanguageContext';

interface UseFormActionsProps {
  formData: DataEntryForm;
  setFormData: React.Dispatch<React.SetStateAction<DataEntryForm>>;
  setIsAutoSaving: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  categories: CategoryWithColumns[];
}

/**
 * Forma əməliyyatlarını idarə edən hook
 */
export const useFormActions = ({
  formData,
  setFormData,
  setIsAutoSaving,
  setIsSubmitting,
  categories
}: UseFormActionsProps) => {
  const { t } = useLanguage();
  const lastOperationTimeRef = useRef<number>(Date.now());
  
  // Dəyəri yeniləmək
  const updateValue = useCallback((categoryId: string, columnId: string, value: any) => {
    lastOperationTimeRef.current = Date.now();
    
    setFormData(prev => {
      // Köhnə formdan yeni kopyasını yaradırıq
      const newEntries = [...prev.entries];
      const categoryIndex = newEntries.findIndex(entry => entry.categoryId === categoryId);
      
      if (categoryIndex !== -1) {
        // Mövcud sütunlar üçün dəyişiklikləri tətbiq edirik
        const values = [...newEntries[categoryIndex].values];
        const valueIndex = values.findIndex(v => v.columnId === columnId);
        
        if (valueIndex !== -1) {
          // Mövcud sütun varsa, onun dəyərini yeniləyirik
          values[valueIndex] = {
            ...values[valueIndex],
            value,
            status: 'pending'
          };
          
          // Əgər əvvəlcədən xəta var idisə, silək
          if (values[valueIndex].errorMessage) {
            delete values[valueIndex].errorMessage;
          }
        } else {
          // Yeni sütun qiymətini əlavə edirik
          values.push({
            columnId,
            value,
            status: 'pending'
          });
        }
        
        // Dəyişiklikləri tətbiq
        newEntries[categoryIndex] = {
          ...newEntries[categoryIndex],
          values
        };
        
        // Kateqoriya tamamlanma faizini yeniləmək
        const category = categories.find(c => c.id === categoryId);
        if (category) {
          const requiredColumns = category.columns.filter(col => col.isRequired);
          const filledRequiredValues = values.filter(val => {
            const column = category.columns.find(col => col.id === val.columnId);
            return column?.isRequired && val.value !== '' && val.value !== null && val.value !== undefined;
          });
          
          const completionPercentage = requiredColumns.length > 0 
            ? (filledRequiredValues.length / requiredColumns.length) * 100 
            : 100;
            
          newEntries[categoryIndex].completionPercentage = completionPercentage;
          newEntries[categoryIndex].isCompleted = completionPercentage === 100;
        }
      }
      
      // Ümumi tamamlanma faizini yeniləmək
      const overallProgress = newEntries.reduce((sum, entry) => sum + entry.completionPercentage, 0) / newEntries.length;
      
      setIsAutoSaving(true);
      
      const updatedFormData = {
        ...prev,
        entries: newEntries,
        overallProgress,
        lastSaved: new Date().toISOString()
      };
      
      // LocalStorage-də saxlayaq
      localStorage.setItem('infolineFormData', JSON.stringify(updatedFormData));
      
      return updatedFormData;
    });
  }, [categories, setFormData, setIsAutoSaving]);
  
  // Manuel saxlama
  const saveForm = useCallback(() => {
    lastOperationTimeRef.current = Date.now();
    
    // Burada real API çağırışı olmalıdır
    console.log("Məlumatlar manual saxlanıldı:", formData);
    
    // LocalStorage-də saxlayaq
    localStorage.setItem('infolineFormData', JSON.stringify(formData));
    
    toast({
      title: t('changesAutoSaved'),
      variant: "default",
    });
    
    setFormData(prev => ({
      ...prev,
      lastSaved: new Date().toISOString()
    }));
  }, [formData, t, setFormData]);
  
  // Təsdiq üçün göndərmək
  const submitForm = useCallback((validateFn: () => boolean) => {
    lastOperationTimeRef.current = Date.now();
    const isValid = validateFn();
    
    if (isValid) {
      setIsSubmitting(true);
      
      // API çağırışı simulyasiyası
      setTimeout(() => {
        const updatedFormData: DataEntryForm = {
          ...formData,
          status: 'submitted',
          entries: formData.entries.map(entry => ({
            ...entry,
            isSubmitted: true,
            approvalStatus: 'pending'
          }))
        };
        
        // LocalStorage-də saxlayaq
        localStorage.setItem('infolineFormData', JSON.stringify(updatedFormData));
        
        setFormData(updatedFormData);
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
  }, [formData, t, setFormData, setIsSubmitting]);
  
  return {
    updateValue,
    saveForm,
    submitForm,
    lastOperationTimeRef
  };
};
