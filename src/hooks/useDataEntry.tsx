
import { useState, useCallback, useEffect, useRef } from 'react';
import { CategoryWithColumns } from '@/types/column';
import { CategoryEntryData } from '@/types/dataEntry';
import { toast } from '@/components/ui/use-toast';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { mockCategories, getDefaultValueByType } from '@/data/mockCategories';
import { useForm } from '@/hooks/useForm';
import { useValidation } from '@/hooks/useValidation';
import { useExcelOperations } from '@/hooks/useExcelOperations';

export const useDataEntry = (initialCategoryId?: string | null) => {
  const { t } = useLanguage();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const urlCategoryId = queryParams.get('categoryId');
  // Prioritize function parameter over URL parameter
  const selectedCategoryId = initialCategoryId || urlCategoryId;
  
  const [categories, setCategories] = useState<CategoryWithColumns[]>(mockCategories);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // URL-də dəyişiklik olduqda category-nin yenilənməsi üçün ref
  const lastCategoryIdRef = useRef<string | null>(selectedCategoryId);

  // Alt hookları birləşdirmək
  const { 
    formData, 
    isAutoSaving, 
    isSubmitting, 
    updateValue, 
    saveForm, 
    submitForm, 
    setupAutoSave,
    initializeForm 
  } = useForm(categories);
  
  const { errors, validateForm, getErrorForColumn } = useValidation(categories, formData.entries);
  
  // Excel əməliyyatları üçün updateFormData funksiyası
  const updateFormDataFromExcel = useCallback((excelData: Record<string, any>, categoryId?: string) => {
    console.log("Excel məlumatları alındı:", excelData);
    
    const newEntries = [...formData.entries];
    
    // Excel-dən alınan məlumatları forma daxil edirik
    Object.entries(excelData).forEach(([columnId, value]) => {
      // Əgər konkret kateqoriya göstərilibsə, yalnız ona aid olan sütunları yeniləyirik
      const category = categoryId 
        ? categories.find(cat => cat.id === categoryId && cat.columns.some(col => col.id === columnId))
        : categories.find(cat => cat.columns.some(col => col.id === columnId));
      
      if (category) {
        const categoryIndex = newEntries.findIndex(entry => entry.categoryId === category.id);
        
        if (categoryIndex !== -1) {
          const valueIndex = newEntries[categoryIndex].values.findIndex(v => v.columnId === columnId);
          
          if (valueIndex !== -1) {
            newEntries[categoryIndex].values[valueIndex] = {
              ...newEntries[categoryIndex].values[valueIndex],
              value,
              status: 'pending'
            };
            
            // Xəta mesajını silirik
            delete newEntries[categoryIndex].values[valueIndex].errorMessage;
          } else {
            newEntries[categoryIndex].values.push({
              columnId,
              value,
              status: 'pending'
            });
          }
        }
      }
    });
    
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
    
    initializeForm(newEntries, formData.status);
    
    // Excel yüklənib bitdikdən sonra formanı validasiya etmək
    setTimeout(() => {
      validateForm();
    }, 500);
  }, [categories, formData.entries, formData.status, initializeForm, validateForm]);

  const { downloadExcelTemplate, uploadExcelData } = useExcelOperations(categories, updateFormDataFromExcel);
  
  // Auto saxlama ilə validasiya əlaqəsi
  useEffect(() => {
    return setupAutoSave(validateForm);
  }, [setupAutoSave, validateForm]);

  // Forma ilkin dəyərləri yükləmək
  useEffect(() => {
    // URL-də kateqoriya dəyişibsə yükləməni yenidən başladırıq
    if (selectedCategoryId !== lastCategoryIdRef.current) {
      setIsLoading(true);
      lastCategoryIdRef.current = selectedCategoryId;
    }
    
    // Yükləmə simulyasiyası
    const loadTimer = setTimeout(() => {
      // Yeni əlavə olunmuş kateqoriyaları və yaxın müddəti olan kateqoriyaları öndə göstərmək
      const sortedCategories = [...mockCategories].sort((a, b) => {
        // Əvvəlcə deadline-a görə sıralama
        if (a.deadline && b.deadline) {
          const deadlineA = new Date(a.deadline);
          const deadlineB = new Date(b.deadline);
          return deadlineA.getTime() - deadlineB.getTime();
        } else if (a.deadline) {
          return -1; // a-nın deadline-ı var, öndə olmalıdır
        } else if (b.deadline) {
          return 1; // b-nin deadline-ı var, öndə olmalıdır
        }
        return 0;
      });
      
      setCategories(sortedCategories);
      
      // Konkret kateqoriya ID-si verilibsə, həmin kateqoriyaya keçirik
      if (selectedCategoryId) {
        const categoryIndex = sortedCategories.findIndex(cat => cat.id === selectedCategoryId);
        if (categoryIndex !== -1) {
          setCurrentCategoryIndex(categoryIndex);
        }
      } else {
        // Vaxtı keçən və ya yaxınlaşan kategorya varsa, ona fokuslanmaq
        const now = new Date();
        const threeDaysLater = new Date(now);
        threeDaysLater.setDate(now.getDate() + 3);

        const overdueOrUrgentCategoryIndex = sortedCategories.findIndex(category => {
          if (!category.deadline) return false;
          const deadlineDate = new Date(category.deadline);
          return deadlineDate <= threeDaysLater;
        });

        if (overdueOrUrgentCategoryIndex !== -1) {
          setCurrentCategoryIndex(overdueOrUrgentCategoryIndex);
        }
      }

      // Real vəziyyətdə burada API-dən məlumatlar yüklənə bilər
      const initialEntries: CategoryEntryData[] = sortedCategories.map(category => ({
        categoryId: category.id,
        values: category.columns.map(column => ({
          columnId: column.id,
          value: getDefaultValueByType(column.type, column.defaultValue),
          status: 'pending'
        })),
        isCompleted: false,
        isSubmitted: false,
        completionPercentage: 0,
        approvalStatus: 'pending'
      }));

      // URL-dan gələn status parametrini yoxlayırıq
      const statusParam = queryParams.get('status');
      let formStatus: 'draft' | 'submitted' | 'approved' | 'rejected' = 'draft';
      
      if (statusParam === 'submitted') {
        formStatus = 'submitted';
        // Bütün entries-ləri submitted edirik
        initialEntries.forEach(entry => {
          entry.isSubmitted = true;
        });
      } else if (statusParam === 'approved') {
        formStatus = 'approved';
        // Bütün entries-ləri approved edirik
        initialEntries.forEach(entry => {
          entry.isSubmitted = true;
          entry.approvalStatus = 'approved';
        });
      } else if (statusParam === 'rejected') {
        formStatus = 'rejected';
        // Bütün entries-ləri rejected edirik
        initialEntries.forEach(entry => {
          entry.isSubmitted = true;
          entry.approvalStatus = 'rejected';
          
          // Random xəta mesajları əlavə edirik (real mühitdə API-dən gələcək)
          if (entry.values.length > 0) {
            const randomValueIndex = Math.floor(Math.random() * entry.values.length);
            entry.values[randomValueIndex].errorMessage = "Bu dəyər uyğun deyil, zəhmət olmasa yenidən yoxlayın";
          }
        });
      }

      initializeForm(initialEntries, formStatus);
      
      // Məlumatları yüklədikdən sonra validasiyanı işə salaq
      setTimeout(() => {
        validateForm();
        setIsLoading(false);
      }, 300);
      
      // Konsol log məlumatı
      console.log("Forma məlumatları yükləndi");
    }, 800);
    
    return () => {
      clearTimeout(loadTimer);
    };
  }, [selectedCategoryId, initializeForm, queryParams, validateForm]);

  // Kateqoriya dəyişmək
  const changeCategory = useCallback((index: number) => {
    if (index >= 0 && index < categories.length) {
      setCurrentCategoryIndex(index);
      
      // Kateqoriya dəyişən kimi formanın üstünə scroll etmək
      window.scrollTo(0, 0);
    }
  }, [categories.length]);

  // Təsdiq üçün göndərmək
  const submitForApproval = useCallback(() => {
    const success = submitForm(validateForm);
    
    if (!success && errors.length > 0) {
      // Xəta olan ilk kateqoriyaya keçid
      const firstErrorIndex = categories.findIndex(cat => 
        cat.columns.some(col => errors.some(err => err.columnId === col.id))
      );
      
      if (firstErrorIndex !== -1) {
        setCurrentCategoryIndex(firstErrorIndex);
      }
    }
  }, [submitForm, validateForm, errors, categories]);

  return {
    categories,
    currentCategoryIndex,
    formData,
    isAutoSaving,
    isSubmitting,
    isLoading,
    errors,
    changeCategory,
    updateValue,
    submitForApproval,
    saveForm,
    getErrorForColumn: (columnId: string) => getErrorForColumn(columnId, formData.entries.flatMap(e => e.values)),
    downloadExcelTemplate,
    uploadExcelData
  };
};
