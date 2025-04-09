
import { useState, useCallback, useEffect, useRef } from 'react';
import { CategoryWithColumns } from '@/types/column';
import { CategoryEntryData } from '@/types/dataEntry';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

interface FormData {
  formId: string;
  schoolId: string;
  entries: CategoryEntryData[];
  lastSaved?: string;
  overallProgress: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
}

export const useForm = (categories: CategoryWithColumns[]) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<FormData>({
    formId: uuidv4(),
    schoolId: '',
    entries: [],
    overallProgress: 0,
    status: 'draft'
  });
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Form məlumatlarını başlanğıc vəziyyətə qaytarmaq üçün metod
  const initializeForm = useCallback((entries: CategoryEntryData[], status = 'draft') => {
    setFormData(prev => ({
      ...prev,
      entries,
      status: status as 'draft' | 'submitted' | 'approved' | 'rejected',
      overallProgress: calculateOverallProgress(entries),
      lastSaved: new Date().toISOString()
    }));
  }, []);

  // Ümumi tamamlanma faizini hesablamaq
  const calculateOverallProgress = (entries: CategoryEntryData[]) => {
    if (entries.length === 0) return 0;
    
    const totalCompletion = entries.reduce((acc, entry) => acc + entry.completionPercentage, 0);
    return Math.round(totalCompletion / entries.length);
  };

  // Sütun dəyərini yeniləmək üçün metod
  const updateValue = useCallback((categoryId: string, columnId: string, value: any) => {
    setFormData(prev => {
      const newEntries = [...prev.entries];
      
      // Kateqoriya üçün giriş tapaq və ya yaradaq
      let entryIndex = newEntries.findIndex(e => e.categoryId === categoryId);
      if (entryIndex === -1) {
        // Kateqoriya üçün yeni giriş yaradırıq
        newEntries.push({
          categoryId,
          values: [],
          isCompleted: false,
          isSubmitted: false,
          completionPercentage: 0,
          approvalStatus: 'pending'
        });
        entryIndex = newEntries.length - 1;
      }
      
      // Dəyəri yeniləyək
      const valueIndex = newEntries[entryIndex].values.findIndex(v => v.columnId === columnId);
      if (valueIndex === -1) {
        // Yeni dəyər əlavə edirik
        newEntries[entryIndex].values.push({
          columnId,
          value,
          status: 'pending'
        });
      } else {
        // Mövcud dəyəri yeniləyirik
        newEntries[entryIndex].values[valueIndex].value = value;
      }
      
      // Tamamlanma faizini yeniləyək
      const currentCategory = categories.find(c => c.id === categoryId);
      if (currentCategory) {
        const requiredColumns = currentCategory.columns.filter(col => col.is_required);
        const filledRequiredValues = newEntries[entryIndex].values.filter(val => {
          const column = currentCategory.columns.find(col => col.id === val.columnId);
          return column?.is_required && val.value && val.value.toString().trim() !== '';
        });
        
        newEntries[entryIndex].completionPercentage = requiredColumns.length > 0 
          ? Math.round((filledRequiredValues.length / requiredColumns.length) * 100)
          : 100;
          
        newEntries[entryIndex].isCompleted = newEntries[entryIndex].completionPercentage === 100;
      }
      
      return {
        ...prev,
        entries: newEntries,
        overallProgress: calculateOverallProgress(newEntries)
      };
    });
  }, [categories]);

  // Formu saxlamaq üçün metod
  const saveForm = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      lastSaved: new Date().toISOString()
    }));
    
    // Avtomatik saxlama bayrağını sıfırlayırıq
    setIsAutoSaving(false);
    
    // Toast bildirişi göstərmirik, istifadəçini narahat etməmək üçün
  }, []);

  // Formu təqdim etmək üçün metod
  const submitForm = useCallback(async () => {
    setIsSubmitting(true);
    
    try {
      // Əvvəlcə formu saxlayırıq
      saveForm();
      
      // Formu təqdim edilmiş kimi işarələyirik
      setFormData(prev => ({
        ...prev,
        status: 'submitted',
        entries: prev.entries.map(entry => ({
          ...entry,
          isSubmitted: true,
          approvalStatus: 'pending'
        }))
      }));
      
      toast.success(t('formSubmitted'));
    } catch (error) {
      console.error('Form təqdim etmə xətası:', error);
      toast.error(t('formSubmitError'));
    } finally {
      setIsSubmitting(false);
    }
  }, [saveForm, t]);

  // Avtomatik saxlama funksiyası üçün metod
  const autoSave = useCallback((validateForm: () => boolean) => {
    setIsAutoSaving(true);
    
    // Formun etibarlılığını yoxlayırıq
    const isValid = validateForm();
    
    // Form etibarlıdırsa saxlayırıq
    if (isValid) {
      saveForm();
    } else {
      setIsAutoSaving(false);
    }
  }, [saveForm]);

  // Avtomatik saxlama funksiyasını qurmaq üçün metod
  const setupAutoSave = useCallback((validateForm: () => boolean) => {
    // Avtomatik saxlama zamanlarını qururuq
    const startAutoSave = () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      autoSaveTimeoutRef.current = setTimeout(() => {
        autoSave(validateForm);
      }, 5000); // 5 saniyə sonra avtomatik saxla
    };
    
    // Formda hər dəyişiklik olduqda avtomatik saxlamağı işə salırıq
    startAutoSave();
    
    // Komponenti bağlayarkən təmizləyirik
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [autoSave]);

  return {
    formData,
    isAutoSaving,
    isSubmitting,
    updateValue,
    saveForm,
    submitForm,
    setupAutoSave,
    initializeForm
  };
};
