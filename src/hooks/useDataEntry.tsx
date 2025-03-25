
import { useState, useCallback, useEffect, useRef } from 'react';
import { CategoryWithColumns } from '@/types/column';
import { toast } from 'sonner';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useForm } from '@/hooks/form';
import { useValidation } from '@/hooks/useValidation';
import { useExcelOperations } from '@/hooks/useExcelOperations';
import { useDataEntryState } from '@/hooks/dataEntry/useDataEntryState';
import { useDataUpdates } from '@/hooks/dataEntry/useDataUpdates';
import { useDataEntries } from '@/hooks/useDataEntries';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useDataEntry = (initialCategoryId?: string | null, statusFilter?: string | null) => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryParams = new URLSearchParams(location.search);
  const urlCategoryId = queryParams.get('categoryId');
  const selectedCategoryId = initialCategoryId || urlCategoryId;

  const { 
    categories, 
    setCategories, 
    isLoading, 
    setIsLoading, 
    currentCategoryIndex, 
    setCurrentCategoryIndex, 
    lastCategoryIdRef,
    fetchCategories
  } = useDataEntryState(selectedCategoryId);

  const { 
    dataEntries,
    loading: entriesLoading,
    fetchDataEntries,
    addDataEntry,
    updateDataEntry,
    submitCategoryForApproval
  } = useDataEntries(user?.schoolId);

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
  
  // Kateqoriya məlumatları yükləmək
  const loadCategoryData = useCallback(async () => {
    if (!user?.schoolId) {
      toast.error(t('notAuthenticated'), {
        description: t('pleaseLogin')
      });
      return;
    }

    setIsLoading(true);

    try {
      // Kateqoriyaları yükləyək
      await fetchCategories();

      // Kateqoriyalar yükləndikdən sonra mövcud daxil edilmiş məlumatları yükləyək
      if (user.schoolId) {
        const { data: existingData, error } = await supabase
          .from('data_entries')
          .select('*')
          .eq('school_id', user.schoolId);

        if (error) throw error;

        // Mövcud məlumatları forma formatına çevirək
        if (existingData && existingData.length > 0) {
          const entriesByCategory = existingData.reduce((acc, entry) => {
            if (!acc[entry.category_id]) {
              acc[entry.category_id] = {
                categoryId: entry.category_id,
                values: [],
                isCompleted: false,
                isSubmitted: entry.status === 'pending' || entry.status === 'approved',
                completionPercentage: 0,
                approvalStatus: entry.status
              };
            }

            acc[entry.category_id].values.push({
              columnId: entry.column_id,
              value: entry.value,
              status: entry.status,
              errorMessage: entry.status === 'rejected' ? entry.rejection_reason : undefined
            });

            return acc;
          }, {} as Record<string, any>);

          // Kateqoriyalar üçün tamamlanma faizini hesablayaq
          Object.keys(entriesByCategory).forEach(categoryId => {
            const category = categories.find(c => c.id === categoryId);
            if (category) {
              const requiredColumns = category.columns.filter(col => col.isRequired);
              const filledRequiredValues = entriesByCategory[categoryId].values.filter(val => {
                const column = category.columns.find(col => col.id === val.columnId);
                return column?.isRequired && val.value !== '' && val.value !== null && val.value !== undefined;
              });
              
              entriesByCategory[categoryId].completionPercentage = requiredColumns.length > 0 
                ? (filledRequiredValues.length / requiredColumns.length) * 100 
                : 100;
                
              entriesByCategory[categoryId].isCompleted = entriesByCategory[categoryId].completionPercentage === 100;
            }
          });

          // Forma məlumatlarını inisializasiya edək
          initializeForm(Object.values(entriesByCategory), 'draft');
        }
      }
    } catch (err) {
      console.error('Error loading category data:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotLoadData')
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchCategories, user, categories, t, initializeForm, setIsLoading]);

  // Məlumatları serverə yerləşdirmək
  const saveDataToServer = useCallback(async (categoryId: string, columnId: string, value: any) => {
    if (!user?.schoolId) return;

    try {
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
          // Təsdiqlənmiş məlumatları dəyişmək olmaz
          toast.error(t('cannotModifyApprovedData'), {
            description: t('contactAdmin')
          });
          return;
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
    } catch (err) {
      console.error('Error saving data to server:', err);
      throw err;
    }
  }, [user, t]);

  // Forma dəyərini yeniləmək və serverə saxlamaq
  const handleUpdateValue = useCallback(async (categoryId: string, columnId: string, value: any) => {
    try {
      // Forma vəziyyətini yeniləmək
      updateValue(categoryId, columnId, value);
      
      // Məlumatı serverdə saxlamaq
      await saveDataToServer(categoryId, columnId, value);
    } catch (err) {
      console.error('Error updating value:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotUpdateData')
      });
    }
  }, [updateValue, saveDataToServer, t]);

  // Kateqoriyanı təsdiq üçün göndərmək
  const handleSubmitForApproval = useCallback(async () => {
    if (!user?.schoolId || categories.length === 0) return;

    const currentCategory = categories[currentCategoryIndex];
    if (!currentCategory) return;

    try {
      // Məlumatları saxlayaq
      saveForm();

      // Bütün məcburi sahələrin doldurulduğunu yoxlayaq
      const isValid = validateForm();
      if (!isValid) {
        toast.error(t('validationError'), {
          description: t('pleaseFixErrors')
        });
        return;
      }

      // Cari kateqoriyanı təsdiqə göndərək
      await submitCategoryForApproval(currentCategory.id, user.schoolId);

      // Kateqoriyaları yenidən yükləyək və vəziyyəti yeniləyək
      fetchCategories();

      toast.success(t('categorySubmitted'), {
        description: t('categorySubmittedDesc')
      });
    } catch (err) {
      console.error('Error submitting for approval:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotSubmitData')
      });
    }
  }, [categories, currentCategoryIndex, user, saveForm, validateForm, submitCategoryForApproval, fetchCategories, t]);

  // Excel əməliyyatları
  const { updateFormDataFromExcel, changeCategory } = useDataUpdates({
    categories,
    formData,
    errors,
    initializeForm,
    validateForm,
    submitForm,
    setCurrentCategoryIndex,
    updateValue,
    saveForm
  });

  const { downloadExcelTemplate, uploadExcelData } = useExcelOperations(categories, async (data, categoryId) => {
    // Excel məlumatlarını forma vəziyyətinə əlavə edək
    updateFormDataFromExcel(data, categoryId);
    
    // Həmçinin məlumatları serverdə də saxlayaq
    if (user?.schoolId && categoryId) {
      try {
        for (const [columnId, value] of Object.entries(data)) {
          await saveDataToServer(categoryId, columnId, value);
        }
        
        toast.success(t('excelDataSaved'), {
          description: t('excelDataUploadedAndSaved')
        });
      } catch (err) {
        console.error('Error saving Excel data to server:', err);
        toast.error(t('errorOccurred'), {
          description: t('someDataMayNotBeSaved')
        });
      }
    }
  });
  
  // Komponent yükləndikdə məlumatları yükləyək
  useEffect(() => {
    loadCategoryData();
  }, [loadCategoryData]);

  // AutoSave funksiyasını quraq
  useEffect(() => {
    return setupAutoSave(validateForm);
  }, [setupAutoSave, validateForm]);

  // Status dəyişdikdə filtri tətbiq edək
  useEffect(() => {
    if (!statusFilter || !categories.length) return;
    
    // Verilən statusa uyğun kateqoriyanı tapaq
    const categoryIndex = categories.findIndex(c => c.status === statusFilter);
    if (categoryIndex !== -1) {
      setCurrentCategoryIndex(categoryIndex);
    }
  }, [statusFilter, categories, setCurrentCategoryIndex]);

  return {
    categories,
    currentCategoryIndex,
    formData,
    isAutoSaving,
    isSubmitting,
    isLoading,
    errors,
    changeCategory,
    updateValue: handleUpdateValue,
    submitForApproval: handleSubmitForApproval,
    saveForm,
    getErrorForColumn: (columnId: string) => getErrorForColumn(columnId),
    downloadExcelTemplate,
    uploadExcelData
  };
};
