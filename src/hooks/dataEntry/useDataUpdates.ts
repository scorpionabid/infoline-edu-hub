
import { useCallback } from 'react';
import { CategoryWithColumns } from '@/types/column';
import { CategoryEntryData, DataEntryForm, ColumnValidationError } from '@/types/dataEntry';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface UseDataUpdatesProps {
  categories: CategoryWithColumns[];
  formData: DataEntryForm;
  errors: ColumnValidationError[];
  initializeForm: (entries: CategoryEntryData[], status: 'draft' | 'submitted' | 'approved' | 'rejected') => void;
  validateForm: () => boolean;
  submitForm: (validateFn: () => boolean) => boolean;
  setCurrentCategoryIndex: (index: number) => void;
  updateValue: (categoryId: string, columnId: string, value: any) => void;
  saveForm: () => void;
}

export const useDataUpdates = ({
  categories,
  formData,
  errors,
  initializeForm,
  validateForm,
  submitForm,
  setCurrentCategoryIndex,
  updateValue,
  saveForm
}: UseDataUpdatesProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  // Excel əməliyyatları üçün updateFormData funksiyası
  const updateFormDataFromExcel = useCallback(async (excelData: Record<string, any>, categoryId?: string) => {
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
    
    // Excel yüklənməsindən sonra məlumatları da saxlayaq
    const updatedFormData = {
      ...formData,
      entries: newEntries,
      overallProgress,
      lastSaved: new Date().toISOString()
    };
    
    // LocalStorage-də saxlayaq
    localStorage.setItem('infolineFormData', JSON.stringify(updatedFormData));
    
    initializeForm(newEntries, formData.status);
    
    // Həmçinin Excel məlumatlarını serverdə də saxlayaq
    if (user?.schoolId && categoryId) {
      try {
        for (const [columnId, value] of Object.entries(excelData)) {
          // Bu sütün və məktəb üçün mövcud məlumat olub-olmadığını yoxlayaq
          const { data: existingData, error: fetchError } = await supabase
            .from('data_entries')
            .select('id, status')
            .eq('school_id', user.schoolId)
            .eq('category_id', categoryId)
            .eq('column_id', columnId)
            .maybeSingle();

          if (fetchError) throw fetchError;

          // Əgər artıq məlumat varsa və təsdiqlənməyibsə, update edək
          if (existingData) {
            if (existingData.status === 'approved') {
              // Təsdiqlənmiş məlumatları atlayırıq
              continue;
            }

            const { error: updateError } = await supabase
              .from('data_entries')
              .update({ value, updated_at: new Date().toISOString() })
              .eq('id', existingData.id);

            if (updateError) throw updateError;
          } 
          // Əgər məlumat yoxdursa, əlavə edək
          else {
            const { error: insertError } = await supabase
              .from('data_entries')
              .insert([{
                school_id: user.schoolId,
                category_id: categoryId,
                column_id: columnId,
                value,
                status: 'pending',
                created_by: user.id
              }]);

            if (insertError) throw insertError;
          }
        }
      } catch (err) {
        console.error('Error saving Excel data to server:', err);
        toast.error(t('errorOccurred'), {
          description: t('someDataMayNotBeSaved')
        });
      }
    }
    
    // Excel yüklənib bitdikdən sonra formanı validasiya etmək
    setTimeout(() => {
      validateForm();
    }, 500);
  }, [categories, formData, initializeForm, validateForm, user, t]);

  // Kateqoriya dəyişmək - təkmilləşdirilmiş funksiya
  const changeCategory = useCallback((index: number) => {
    if (index >= 0 && index < categories.length) {
      // Kateqoriya dəyişməzdən əvvəl cari məlumatları saxlayaq
      saveForm(); // <-- Manual olaraq saxlayırıq
      
      // İndi kateqoriyanı dəyişək
      setCurrentCategoryIndex(index);
      
      // Kateqoriya dəyişdiyi haqqında daha detallı məlumat verək
      console.log(`Kateqoriya dəyişdirilib: ${categories[index].name}`);
      console.log(`Kateqoriya sütunları:`, categories[index].columns);
      
      // Kateqoriya daxilində məlumatların mövcudluğunu yoxlayaq
      const entry = formData.entries.find(e => e.categoryId === categories[index].id);
      if (entry) {
        console.log(`Kateqoriya məlumatları:`, entry.values);
      } else {
        console.log(`Kateqoriya üçün məlumatlar tapılmadı`);
      }
      
      // Yeni kateqoriyaya keçdiyimizi bildirək
      toast.success(t('categoryChanged'), {
        description: categories[index].name
      });
      
      // Kateqoriya dəyişən kimi formanın üstünə scroll etmək
      window.scrollTo(0, 0);
    }
  }, [categories, setCurrentCategoryIndex, saveForm, t, formData.entries]);

  return {
    updateFormDataFromExcel,
    changeCategory
  };
};
