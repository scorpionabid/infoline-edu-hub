
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { useValidation } from './validation';
import { CategoryWithColumns } from '@/types/column';
import { CategoryEntryData } from '@/types/dataEntry';

export interface DataEntryForm {
  id: string;
  schoolId: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  categories: CategoryData[];
  overallCompletionPercentage: number;
  entries?: CategoryEntryData[];
}

interface CategoryData {
  categoryId: string;
  entries: EntryData[];
  completionPercentage: number;
}

interface EntryData {
  columnId: string;
  value: any;
  errors: string[];
  touched: boolean;
}

interface UseDataEntryProps {
  initialFormData?: DataEntryForm;
  schoolId?: string;
  categories?: CategoryWithColumns[];
}

export const useDataEntry = ({ 
  initialFormData, 
  schoolId, 
  categories = [] 
}: UseDataEntryProps) => {
  const [formData, setFormData] = useState<DataEntryForm>(
    initialFormData || {
      id: '',
      schoolId: schoolId || '',
      status: 'draft',
      categories: [],
      overallCompletionPercentage: 0
    }
  );
  
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any[]>([]);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const validation = useValidation(categories, formData.entries || []);
  
  // Formun kategori və sütunlarını hazırla
  const initializeForm = useCallback((categories: CategoryWithColumns[]) => {
    if (!categories || categories.length === 0) return;
    
    const categoryData = categories.map(category => {
      // Kateqoriya üçün sətirlər (entries) yaradın
      const entries = category.columns.map((column) => ({
        columnId: column.id,
        value: '',
        errors: [],
        touched: false
      }));

      return {
        categoryId: category.id,
        entries,
        completionPercentage: 0
      };
    });

    setFormData(prev => ({
      ...prev,
      categories: categoryData,
      overallCompletionPercentage: 0
    }));
  }, []);

  useEffect(() => {
    if (categories && categories.length > 0) {
      initializeForm(categories);
    }
  }, [categories, initializeForm]);

  // Form dəyəri yeniləyin
  const updateValue = useCallback((categoryId: string, columnId: string, value: any) => {
    setFormData(prevData => {
      const newData = { ...prevData };
      
      // Əvvəlcə lazımi kateqoriyanı tapın
      const categoryIndex = newData.categories.findIndex(cat => cat.categoryId === categoryId);
      if (categoryIndex === -1) return prevData;
      
      // Sonra, lazımi sütunu tapın
      const entryIndex = newData.categories[categoryIndex].entries.findIndex(entry => entry.columnId === columnId);
      if (entryIndex === -1) return prevData;
      
      // Dəyəri yeniləyin və toxunulmuş olaraq işarələyin
      newData.categories[categoryIndex].entries[entryIndex].value = value;
      newData.categories[categoryIndex].entries[entryIndex].touched = true;
      
      // Xətaları təmizləyin (yeni dəyər üçün doğrulanma daha sonra aparılacaq)
      newData.categories[categoryIndex].entries[entryIndex].errors = [];
      
      // Dəyişikliklər bildirildi
      setHasPendingChanges(true);
      
      return newData;
    });
  }, []);

  // Kateqoriya dəyişdirmək üçün funksiya
  const changeCategory = useCallback((index: number) => {
    if (index >= 0 && index < categories.length) {
      setCurrentCategoryIndex(index);
    }
  }, [categories.length]);

  // Tamamlanma faizini yenidən hesablayın
  const recalculateCompletionPercentage = useCallback(() => {
    setFormData(prevData => {
      const newData = { ...prevData };
      
      // Hər kateqoriya üçün tamamlanma faizini hesablayın
      newData.categories.forEach((category, catIndex) => {
        const totalEntries = category.entries.length;
        if (totalEntries === 0) {
          newData.categories[catIndex].completionPercentage = 100;
          return;
        }
        
        const filledEntries = category.entries.filter(entry => entry.value !== '' && entry.value !== null && entry.value !== undefined).length;
        const percentage = Math.round((filledEntries / totalEntries) * 100);
        newData.categories[catIndex].completionPercentage = percentage;
      });
      
      // Ümumi tamamlanma faizini hesablayın
      const totalCategories = newData.categories.length;
      if (totalCategories === 0) {
        newData.overallCompletionPercentage = 0;
      } else {
        const totalPercentage = newData.categories.reduce((sum, category) => sum + category.completionPercentage, 0);
        newData.overallCompletionPercentage = Math.round(totalPercentage / totalCategories);
      }
      
      return newData;
    });
  }, []);

  // Form məlumatlarını yeniləyin (tam dəyişiklik)
  const updateFormData = useCallback((newData: Partial<DataEntryForm>) => {
    setFormData(prevData => {
      const updatedData = { ...prevData, ...newData };
      setHasPendingChanges(true);
      return updatedData;
    });
  }, []);

  // Excel şablonunu endirmək üçün funksiya
  const downloadExcelTemplate = useCallback((categoryId: string) => {
    // Burada Excel şablonu yaratma və endirmə məntiqi əlavə ediləcək
    console.log("Excel template download requested for category:", categoryId);
    toast({
      title: t('success'),
      description: t('excel.templateDownloaded'),
    });
  }, [t, toast]);

  // Excel məlumatlarını yükləmək üçün funksiya
  const uploadExcelData = useCallback((file: File, categoryId: string) => {
    // Burada Excel məlumatlarının yüklənməsi məntiqi əlavə ediləcək
    console.log("Excel file upload requested:", file.name, "for category:", categoryId);
    toast({
      title: t('success'),
      description: t('excel.importSuccess'),
    });
  }, [t, toast]);

  // Formu təsdiq üçün göndərmək üçün funksiya
  const submitForApproval = useCallback(() => {
    setIsSubmitting(true);
    // Burada formu təsdiq üçün göndərmə məntiqi əlavə ediləcək
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: t('success'),
        description: t('dataEntrySubmitted'),
      });
    }, 1500);
  }, [t, toast]);

  // Formu saxlamaq üçün funksiya
  const saveForm = useCallback(() => {
    setIsSaving(true);
    // Burada formu saxlama məntiqi əlavə ediləcək
    setTimeout(() => {
      setIsSaving(false);
      setLastSaved(new Date());
      toast({
        title: t('success'),
        description: t('dataEntrySaved'),
      });
    }, 1500);
  }, [t, toast]);

  // Sütun üçün xəta mesajını əldə et
  const getErrorForColumn = useCallback((columnId: string) => {
    return validation.getErrorForColumn(columnId);
  }, [validation]);

  // Avtomatik qeyd etmə aralığı
  useEffect(() => {
    let autoSaveTimer: NodeJS.Timeout;
    
    if (hasPendingChanges && !isSubmitting && !isSaving && user) {
      autoSaveTimer = setTimeout(() => {
        setIsAutoSaving(true);
        saveForm();
      }, 30000); // 30 saniyə
    }
    
    return () => {
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
    };
  }, [hasPendingChanges, isSubmitting, isSaving, user, saveForm]);

  return {
    formData,
    updateFormData,
    categories,
    currentCategoryIndex,
    isAutoSaving,
    isSubmitting,
    isLoading: loading,
    errors,
    lastSaved,
    setIsAutoSaving,
    loading,
    updateValue,
    changeCategory,
    recalculateCompletionPercentage,
    saveForm,
    setIsSubmitting,
    isSaving,
    validation,
    getErrorForColumn,
    downloadExcelTemplate,
    uploadExcelData,
    submitForApproval
  };
};

export default useDataEntry;
