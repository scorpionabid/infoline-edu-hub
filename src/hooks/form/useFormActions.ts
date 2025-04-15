
import { useState, useCallback, useRef, useEffect } from 'react';
import { DataEntryForm, CategoryEntryData } from '@/types/dataEntry';

export interface UseFormActionsProps {
  formData: DataEntryForm;
  setFormData: (data: DataEntryForm) => void;
  updateFormData: (data: Partial<DataEntryForm>) => void;
  categories: any[];
}

/**
 * @description Form əməliyyatlarını idarə etmək üçün hook
 */
export const useFormActions = ({
  formData,
  setFormData,
  updateFormData,
  categories
}: UseFormActionsProps) => {
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Form dəyərlərini yeniləmək üçün funksiya
  const updateValue = useCallback((categoryId: string, columnId: string, value: any) => {
    updateFormData(prevData => {
      const updatedEntries = [...(prevData.entries || [])];
      
      // Kateqoriya girdisi var mı?
      const categoryEntryIndex = updatedEntries.findIndex(entry => entry.categoryId === categoryId);
      
      if (categoryEntryIndex !== -1) {
        // Kateqoriya girdisini tap və yenilə
        const categoryEntry = updatedEntries[categoryEntryIndex];
        const valueIndex = categoryEntry.values.findIndex(v => v.columnId === columnId);
        
        // Sütun dəyəri var mı?
        if (valueIndex !== -1) {
          // Mövcud dəyəri yenilə
          categoryEntry.values[valueIndex].value = value;
        } else {
          // Yeni dəyər əlavə et
          categoryEntry.values.push({
            columnId,
            value
          });
        }
        
        // Yenilənmiş girişi əlavə et
        updatedEntries[categoryEntryIndex] = categoryEntry;
      } else {
        // Yeni kateqoriya girdisi yarat
        updatedEntries.push({
          categoryId,
          values: [{
            columnId,
            value
          }],
          completionPercentage: 0
        });
      }
      
      // Tamamlanma faizini hesabla
      calculateCompletionPercentage(updatedEntries);
      
      return {
        ...prevData,
        entries: updatedEntries
      };
    });
  }, [updateFormData]);
  
  // Tamamlanma faizini hesablamaq üçün funksiya
  const calculateCompletionPercentage = (entries: CategoryEntryData[]) => {
    if (!categories || categories.length === 0) return;
    
    let totalRequired = 0;
    let totalFilled = 0;
    
    // Bütün məcburi sahələri say
    categories.forEach(category => {
      const requiredColumns = category.columns.filter(col => col.is_required);
      totalRequired += requiredColumns.length;
      
      // Bu kateqoriya üçün doldurulan məcburi sahələri say
      const categoryEntry = entries.find(entry => entry.categoryId === category.id);
      if (categoryEntry) {
        requiredColumns.forEach(column => {
          const value = categoryEntry.values.find(v => v.columnId === column.id)?.value;
          if (value !== undefined && value !== null && value !== '') {
            totalFilled++;
          }
        });
      }
    });
    
    // Ümumi tamamlanma faizini hesabla
    const overallPercentage = totalRequired > 0 ? (totalFilled / totalRequired) * 100 : 0;
    updateFormData({ overallCompletionPercentage: overallPercentage });
    
    // Hər bir kateqoriya üçün tamamlanma faizini hesabla
    entries.forEach(entry => {
      const category = categories.find(c => c.id === entry.categoryId);
      if (category) {
        const requiredColumns = category.columns.filter(col => col.is_required);
        if (requiredColumns.length > 0) {
          let filledCount = 0;
          requiredColumns.forEach(column => {
            const value = entry.values.find(v => v.columnId === column.id)?.value;
            if (value !== undefined && value !== null && value !== '') {
              filledCount++;
            }
          });
          entry.completionPercentage = (filledCount / requiredColumns.length) * 100;
        } else {
          entry.completionPercentage = 100;
        }
      }
    });
  };
  
  // Form məlumatlarını ilkin dəyərləndirmək üçün funksiya
  const initializeForm = useCallback((entries: CategoryEntryData[], status: string = 'draft') => {
    const initialForm: DataEntryForm = {
      categories: categories.map(category => ({
        category,
        fields: category.columns.map(column => {
          const entry = entries.find(e => e.categoryId === category.id);
          const value = entry?.values.find(v => v.columnId === column.id)?.value || '';
          const valueStatus = entry?.values.find(v => v.columnId === column.id)?.status;
          const errorMessage = entry?.values.find(v => v.columnId === column.id)?.errorMessage;
          
          return {
            column,
            value: {
              columnId: column.id,
              value,
              status: valueStatus,
              errorMessage
            }
          };
        }),
        completionPercentage: entries.find(e => e.categoryId === category.id)?.completionPercentage || 0
      })),
      overallCompletionPercentage: calculateOverallCompletionPercentage(entries, categories),
      entries,
      status,
      lastSaved: new Date().toISOString()
    };
    
    setFormData(initialForm);
  }, [categories, setFormData]);
  
  // Ümumi tamamlanma faizini hesablamaq üçün yardımçı funksiya
  const calculateOverallCompletionPercentage = (entries: CategoryEntryData[], categories: any[]) => {
    if (!categories || categories.length === 0) return 0;
    
    let totalRequired = 0;
    let totalFilled = 0;
    
    categories.forEach(category => {
      const requiredColumns = category.columns.filter((col: any) => col.is_required);
      totalRequired += requiredColumns.length;
      
      const categoryEntry = entries.find(entry => entry.categoryId === category.id);
      if (categoryEntry) {
        requiredColumns.forEach((column: any) => {
          const value = categoryEntry.values.find(v => v.columnId === column.id)?.value;
          if (value !== undefined && value !== null && value !== '') {
            totalFilled++;
          }
        });
      }
    });
    
    return totalRequired > 0 ? (totalFilled / totalRequired) * 100 : 0;
  };
  
  // Form dəyərlərini saxlamaq üçün funksiya
  const saveForm = useCallback(() => {
    setIsAutoSaving(true);
    
    try {
      // API çağırışı simulyasiyası
      setTimeout(() => {
        updateFormData({
          lastSaved: new Date().toISOString()
        });
        setIsAutoSaving(false);
      }, 500);
    } catch (err) {
      console.error('Form saved error:', err);
      setIsAutoSaving(false);
    }
  }, [updateFormData]);
  
  // Formu təqdim etmək üçün funksiya
  const submitForm = useCallback(() => {
    setIsSubmitting(true);
    
    try {
      // API çağırışı simulyasiyası
      setTimeout(() => {
        updateFormData({
          status: 'submitted',
          lastSaved: new Date().toISOString()
        });
        setIsSubmitting(false);
      }, 1000);
    } catch (err) {
      console.error('Form submission error:', err);
      setIsSubmitting(false);
    }
  }, [updateFormData]);
  
  // Auto-save funksionallığı üçün setup
  const setupAutoSave = useCallback(() => {
    // Auto-save intervalını təmizlə
    if (autoSaveTimeoutRef.current) {
      clearInterval(autoSaveTimeoutRef.current);
    }
    
    // Qayıt funksiyası üçün temizlik
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearInterval(autoSaveTimeoutRef.current);
      }
    };
  }, []);
  
  return {
    isAutoSaving,
    isSubmitting,
    updateValue,
    saveForm,
    submitForm,
    setupAutoSave,
    initializeForm,
    setIsAutoSaving,
    setIsSubmitting
  };
};
