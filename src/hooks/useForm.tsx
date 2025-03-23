
import { useState, useCallback, useRef } from 'react';
import { CategoryWithColumns } from '@/types/column';
import { DataEntryForm, CategoryEntryData, EntryValue } from '@/types/dataEntry';
import { toast } from '@/components/ui/use-toast';
import { useLanguage } from '@/context/LanguageContext';

export const useForm = (categories: CategoryWithColumns[]) => {
  const { t } = useLanguage();
  
  // Son əməliyyat zamanının qeydini saxlamaq üçün ref
  const lastOperationTimeRef = useRef<number>(Date.now());
  
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
    // Daha öncə saxlanılmış məlumatlar varsa onları localStorage-dən yükləyək
    const savedFormData = localStorage.getItem('infolineFormData');
    
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        if (parsedData.entries && parsedData.entries.length > 0) {
          // LocalStorage-də olan məlumatlarla serverdən gələn məlumatları birləşdirmək
          const mergedEntries = initialEntries.map(initialEntry => {
            const savedEntry = parsedData.entries.find((e: CategoryEntryData) => e.categoryId === initialEntry.categoryId);
            if (savedEntry) {
              // Savedentry-də olan dəyərləri initialEntry-yə köçürək
              initialEntry.values = savedEntry.values;
              initialEntry.completionPercentage = savedEntry.completionPercentage;
              initialEntry.isCompleted = savedEntry.isCompleted;
            }
            return initialEntry;
          });
          
          setFormData({
            ...parsedData,
            entries: mergedEntries,
            status: formStatus,
            lastSaved: new Date().toISOString()
          });
          return;
        }
      } catch (error) {
        console.error('LocalStorage-dən məlumatların yüklənməsi zamanı xəta:', error);
      }
    }
    
    // Əgər localStorage-də məlumat yoxdursa, ilkin məlumatları istifadə et
    setFormData(prev => ({
      ...prev,
      entries: initialEntries,
      lastSaved: new Date().toISOString(),
      status: formStatus
    }));
  }, []);
  
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
  }, [categories]);
  
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
  }, [formData, t]);
  
  // Təsdiq üçün göndərmək - TypeScript xətası burada düzəldildi
  const submitForm = useCallback((validateFn: () => boolean) => {
    lastOperationTimeRef.current = Date.now();
    const isValid = validateFn();
    
    if (isValid) {
      setIsSubmitting(true);
      
      // API çağırışı simulyasiyası
      setTimeout(() => {
        // Burada tipləri dəqiq təyin edirik - TypeScript xətasının həlli
        const updatedFormData: DataEntryForm = {
          ...formData,
          status: 'submitted' as 'draft' | 'submitted' | 'approved' | 'rejected',
          entries: formData.entries.map(entry => ({
            ...entry,
            isSubmitted: true,
            approvalStatus: 'pending' as 'pending' | 'approved' | 'rejected'
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
  }, [formData, t]);
  
  // Auto saxlama simulyasiyası
  const setupAutoSave = useCallback((validateFn: () => boolean) => {
    if (isAutoSaving) {
      // Yalnız son əməliyyatdan 1.5 saniyə keçibsə avtomatik saxlayaq
      const timer = setTimeout(() => {
        const currentTime = Date.now();
        const timeSinceLastOperation = currentTime - lastOperationTimeRef.current;
        
        // Əgər istifadəçi son 1.5 saniyədə yeni dəyişiklik etməyibsə
        if (timeSinceLastOperation >= 1500) {
          // Burada real API çağırışı olmalıdır
          console.log("Məlumatlar avtomatik saxlanıldı:", formData);
          
          // LocalStorage-də saxlayaq
          localStorage.setItem('infolineFormData', JSON.stringify(formData));
          
          setIsAutoSaving(false);
          
          toast({
            title: t('changesAutoSaved'),
            variant: "default",
          });
          
          // Məlumatları saxladıqdan sonra validasiya etmək
          validateFn();
        }
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
